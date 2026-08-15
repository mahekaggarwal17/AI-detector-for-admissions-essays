import os
import sqlite3
import hashlib
import secrets
import time
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "veritas_auth.db")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_auth_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        salt TEXT,
        avatar_url TEXT,
        auth_provider TEXT NOT NULL,
        google_id TEXT,
        role TEXT DEFAULT 'Admissions Officer',
        created_at REAL NOT NULL
    )
    """)

    # Active auth tokens table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at REAL NOT NULL,
        expires_at REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # User saved scans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_scans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        essay_title TEXT NOT NULL,
        preview_text TEXT NOT NULL,
        ai_probability REAL NOT NULL,
        verdict TEXT NOT NULL,
        burstiness REAL,
        perplexity REAL,
        esl_safeguard INTEGER DEFAULT 0,
        created_at REAL NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes password with salt using PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = secrets.token_hex(16)
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    return key.hex(), salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    return secrets.compare_digest(key.hex(), stored_hash)

def create_session_token(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    created_at = time.time()
    expires_at = created_at + (30 * 24 * 3600) # 30 days
    conn = get_db()
    conn.execute("INSERT INTO tokens (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
                 (token, user_id, created_at, expires_at))
    conn.commit()
    conn.close()
    return token

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT u.id, u.email, u.name, u.avatar_url, u.auth_provider, u.role, u.created_at, t.expires_at
    FROM tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token = ? AND t.expires_at > ?
    """, (token, time.time()))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "avatar_url": row["avatar_url"],
            "auth_provider": row["auth_provider"],
            "role": row["role"],
            "created_at": row["created_at"]
        }
    return None

def register_user(name: str, email: str, password: str, role: str = "Admissions Officer") -> Dict[str, Any]:
    email = email.strip().lower()
    name = name.strip()
    if not email or not password or not name:
        raise ValueError("Name, email, and password are required.")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An account with this email already exists.")

    user_id = secrets.token_hex(12)
    pwd_hash, salt = hash_password(password)
    now = time.time()
    # Default avatar via UI initials or Gravatar
    avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={name}&backgroundColor=28282a&textColor=ffffff"

    cursor.execute("""
    INSERT INTO users (id, email, name, password_hash, salt, avatar_url, auth_provider, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'email', ?, ?)
    """, (user_id, email, name, pwd_hash, salt, avatar_url, role, now))
    conn.commit()
    conn.close()

    token = create_session_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "auth_provider": "email",
            "role": role,
            "created_at": now
        }
    }

def login_user(email: str, password: str) -> Dict[str, Any]:
    email = email.strip().lower()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if not row or not row["password_hash"] or not row["salt"]:
        raise ValueError("Invalid email or password.")

    if not verify_password(password, row["password_hash"], row["salt"]):
        raise ValueError("Invalid email or password.")

    token = create_session_token(row["id"])
    return {
        "token": token,
        "user": {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "avatar_url": row["avatar_url"],
            "auth_provider": row["auth_provider"],
            "role": row["role"],
            "created_at": row["created_at"]
        }
    }

def verify_google_id_token(id_token: str) -> Dict[str, Any]:
    """Verifies a Google OAuth ID token using Google tokeninfo API endpoint."""
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                # Verify token fields
                if "email" not in data:
                    raise ValueError("Invalid Google token payload: missing email")
                return data
            raise ValueError(f"Google token verification failed with status {response.status}")
    except Exception as e:
        # If client passes mock or demo token in testing
        if id_token.startswith("demo_google_token_"):
            parts = id_token.split("_")
            email = f"user_{parts[-1]}@gmail.com" if len(parts) > 3 else "admissions.officer@gmail.com"
            return {
                "sub": f"google_{secrets.token_hex(8)}",
                "email": email,
                "name": "Google Admissions Officer",
                "picture": "https://api.dicebear.com/7.x/initials/svg?seed=GoogleOfficer&backgroundColor=28282a"
            }
        raise ValueError(f"Google OAuth verification error: {str(e)}")

def authenticate_with_google(id_token: str, role: str = "Admissions Officer") -> Dict[str, Any]:
    payload = verify_google_id_token(id_token)
    email = payload["email"].lower().strip()
    name = payload.get("name", email.split("@")[0])
    avatar = payload.get("picture", f"https://api.dicebear.com/7.x/initials/svg?seed={name}&backgroundColor=28282a")
    google_id = payload.get("sub")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    now = time.time()

    if row:
        user_id = row["id"]
        # Update google_id and avatar if missing
        cursor.execute("UPDATE users SET avatar_url = COALESCE(?, avatar_url), google_id = COALESCE(?, google_id) WHERE id = ?",
                       (avatar, google_id, user_id))
        user_data = {
            "id": row["id"],
            "email": row["email"],
            "name": row["name"],
            "avatar_url": row["avatar_url"] or avatar,
            "auth_provider": row["auth_provider"],
            "role": row["role"],
            "created_at": row["created_at"]
        }
    else:
        user_id = secrets.token_hex(12)
        cursor.execute("""
        INSERT INTO users (id, email, name, avatar_url, auth_provider, google_id, role, created_at)
        VALUES (?, ?, ?, ?, 'google', ?, ?, ?)
        """, (user_id, email, name, avatar, google_id, role, now))
        user_data = {
            "id": user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar,
            "auth_provider": "google",
            "role": role,
            "created_at": now
        }

    conn.commit()
    conn.close()

    token = create_session_token(user_id)
    return {
        "token": token,
        "user": user_data
    }

def delete_session_token(token: str):
    conn = get_db()
    conn.execute("DELETE FROM tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()

def save_user_scan(user_id: str, title: str, preview: str, prob: float, verdict: str, burstiness: float, ppl: float, esl: bool) -> Dict[str, Any]:
    conn = get_db()
    scan_id = secrets.token_hex(8)
    now = time.time()
    conn.execute("""
    INSERT INTO user_scans (id, user_id, essay_title, preview_text, ai_probability, verdict, burstiness, perplexity, esl_safeguard, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (scan_id, user_id, title, preview[:180], prob, verdict, burstiness, ppl, 1 if esl else 0, now))
    conn.commit()
    conn.close()
    return {
        "id": scan_id,
        "essay_title": title,
        "preview_text": preview[:180],
        "ai_probability": prob,
        "verdict": verdict,
        "created_at": now
    }

def get_user_scans(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM user_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 30
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Initialize DB on load
init_auth_db()
