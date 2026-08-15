import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.detector import AIDetectorEngine
from data.samples import SAMPLE_ESSAYS
from data.dataset import DATASET_METADATA, EVALUATION_METRICS, CONFIDENTLY_WRONG_CASES
import auth

app = FastAPI(
    title="VERITAS — AI Admissions Essay Detector & Auth API",
    description="Statistical AI detection engine with secure user accounts & Google OAuth integration.",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = AIDetectorEngine()

# --- Request / Response Models ---
class AnalyzeRequest(BaseModel):
    text: str
    title: Optional[str] = "Untitled Admissions Essay"

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Admissions Officer"

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str  # ID token returned by Google One-Tap / GIS button
    role: Optional[str] = "Admissions Officer"

class SaveScanRequest(BaseModel):
    essay_title: str
    preview_text: str
    ai_probability: float
    verdict: str
    burstiness: Optional[float] = 0.0
    perplexity: Optional[float] = 0.0
    esl_safeguard: Optional[bool] = False

# Dependency to extract and verify Bearer token
def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[Dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    return auth.get_user_by_token(token)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "VERITAS AI Admissions Detector Engine API",
        "version": "1.1.0",
        "auth_enabled": True
    }

# =========================================================================
# Authentication & Google OAuth Endpoints
# =========================================================================

@app.get("/api/auth/config")
def get_auth_config():
    """Returns public authentication parameters like Google Client ID."""
    return {
        "google_client_id": os.environ.get("GOOGLE_CLIENT_ID", "603289190186-p11c8d50e82r7s7902s6869g.apps.googleusercontent.com"),
        "auth_providers": ["email", "google"]
    }

@app.post("/api/auth/register")
def handle_register(payload: RegisterRequest):
    """Registers a new user account."""
    try:
        res = auth.register_user(payload.name, payload.email, payload.password, payload.role)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")

@app.post("/api/auth/login")
def handle_login(payload: LoginRequest):
    """Logs in an existing user with email and password."""
    try:
        res = auth.login_user(payload.email, payload.password)
        return res
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")

@app.post("/api/auth/google")
def handle_google_auth(payload: GoogleAuthRequest):
    """Authenticates or signs up a user using a Google OAuth ID Token."""
    try:
        res = auth.authenticate_with_google(payload.credential, payload.role)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Authentication failed: {str(e)}")

@app.get("/api/auth/me")
def get_current_user_profile(authorization: Optional[str] = Header(None)):
    """Fetches profile for authenticated user."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized or session expired.")
    return {"user": user}

@app.post("/api/auth/logout")
def handle_logout(authorization: Optional[str] = Header(None)):
    """Logs out and invalidates current session token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        auth.delete_session_token(token)
    return {"status": "success", "message": "Logged out successfully"}

@app.get("/api/auth/scans")
def get_saved_scans(authorization: Optional[str] = Header(None)):
    """Fetches past scans for the authenticated user."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    scans = auth.get_user_scans(user["id"])
    return {"scans": scans}

@app.post("/api/auth/scans")
def save_scan(payload: SaveScanRequest, authorization: Optional[str] = Header(None)):
    """Saves a detected essay scan under the user's account."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    res = auth.save_user_scan(
        user["id"],
        payload.essay_title,
        payload.preview_text,
        payload.ai_probability,
        payload.verdict,
        payload.burstiness,
        payload.perplexity,
        payload.esl_safeguard
    )
    return res

# =========================================================================
# Detector & Data Endpoints
# =========================================================================

@app.post("/api/analyze")
def analyze_essay(payload: AnalyzeRequest, authorization: Optional[str] = Header(None)):
    """Performs full statistical AI detection on essay text."""
    if not payload.text or len(payload.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short. Please provide at least 2-3 sentences.")
    
    result = detector.analyze_essay(payload.text)
    
    # Auto-save scan if user is authenticated
    user = get_current_user(authorization)
    if user:
        try:
            auth.save_user_scan(
                user["id"],
                payload.title or "Admissions Essay",
                payload.text,
                result["overall_ai_probability"],
                result["overall_verdict"],
                result.get("stats", {}).get("burstiness_index", 0.0),
                result.get("stats", {}).get("overall_perplexity", 0.0),
                result.get("esl_safeguard", {}).get("is_esl_candidate", False)
            )
        except Exception:
            pass

    return result

@app.get("/api/samples")
def get_samples():
    """Returns curated benchmark sample essays."""
    return {"samples": SAMPLE_ESSAYS}

@app.get("/api/dataset")
def get_dataset_info():
    """Returns benchmark dataset metadata and breakdown."""
    return DATASET_METADATA

@app.get("/api/evaluation")
def get_evaluation_report():
    """Returns held-out test evaluation results and 3 failure cases."""
    return {
        "metrics": EVALUATION_METRICS,
        "confidently_wrong_cases": CONFIDENTLY_WRONG_CASES
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
