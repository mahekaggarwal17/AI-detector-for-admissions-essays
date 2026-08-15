# VERITAS — AI Admissions Essay Detector

> **International Hackathon Edition** · Statistical · Explainable · ESL-Safe

A working web application that detects AI-generated college admissions essays with **sentence-level explainability** and a cinematic dark UI. Built without any LLM API wrappers — pure statistical NLP.

---

## ✨ Live Demo

**[veritas-theta-cyan.vercel.app](https://veritas-theta-cyan.vercel.app)**

---

## 🏆 What Makes This Hackathon-Level

### Design System
- **Aurora gradient background** with animated orbs & CSS grid overlay
- **Outfit + Inter + JetBrains Mono** typography stack
- **Animated glassmorphism** with layered shadows and glow effects
- **Micro-animations** — slide-up reveals, staggered list entrances, floating elements

### Detector Tab — Command Center
- **Animated circular gauge** for overall AI probability score (SVG + CSS animation)
- **Roll-up number counters** — values animate from 0 to target on result arrival
- **Animated progress bars** with neon glow matching each metric color
- **Staggered sentence highlights** — each sentence fades in with delay
- **Drag-and-drop file upload** + category-colored sample chips
- **Sentence inspector** — click any sentence to expand metrics inline

### Evaluation Tab — Research-Grade Report
- **Animated metric cards** with color-coded top borders
- **Visual comparison bar** (36% vs 4% ESL FPR) animates on load
- **Smooth case-study transitions** with animated reveal
- **Animated number counters** for accuracy / precision / F1 / AUC

### Dataset Tab — Corpus Explorer
- **Animated SVG donut chart** for corpus composition breakdown
- **Glowing color-coded corpus cards** per category
- **Formula blocks** in JetBrains Mono with syntax-colored output
- **Responsive data table** with hover effects

---

## 🧮 Detection Engine (Zero LLM Wrappers)

| Feature | Description |
|---------|-------------|
| **Perplexity & Surprisal** | Token predictability against n-gram language model |
| **Goh-Barabasi Burstiness** | `B = (σ−μ)/(σ+μ)` sentence length variance index |
| **Syntactic Uniformity** | Shannon entropy + Type-Token Ratio |
| **AI Buzzword Density** | 150+ over-represented admissions clichés |
| **ESL Safeguard** | Decouples non-native English from machine generation |

**Held-out test performance:** 92.7% Accuracy · 93.8% Precision · 91.3% Recall · 92.5% F1 · 0.962 AUC

**ESL False Positive Rate:** 4.0% (vs 36.0% for generic detectors)

---

## 🗂️ Architecture

```
AI-detector-for-admissions-essays/
├── backend/
│   ├── engine/
│   │   ├── detector.py          # Master statistical AI detector engine
│   │   ├── perplexity.py        # Token perplexity & surprisal calculator
│   │   ├── burstiness.py        # Sentence length CV & Goh-Barabasi burstiness
│   │   ├── vocabulary.py        # TTR, Shannon entropy, 150+ AI buzzwords
│   │   └── esl_safeguard.py     # ESL non-native false-positive safeguard
│   ├── data/
│   │   ├── dataset.py           # Dataset metadata & 3 failure cases
│   │   └── samples.py           # Pre-loaded benchmark sample essays
│   └── main.py                  # FastAPI server endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DetectorView.jsx         # Command center layout + drag-drop
│   │   │   ├── SentenceHighlighter.jsx  # Staggered animated highlights
│   │   │   ├── ExplainabilityPanel.jsx  # Circular gauge + animated bars
│   │   │   ├── DatasetView.jsx          # SVG donut chart + formulas
│   │   │   └── EvaluationView.jsx       # Metric cards + comparison bars
│   │   ├── App.jsx              # Hero header + animated ticker + navbar
│   │   └── index.css            # Aurora design system + all animations
│   └── package.json
├── DATASET_DOCUMENTATION.md
├── EVALUATION_REPORT.md
└── README.md
```

---

## 🚀 Running Locally

### 1. Start FastAPI Backend

```bash
# Activate virtual environment
venv\Scripts\activate

# Run FastAPI on port 8000
cd backend
python -m uvicorn main:app --reload --port 8000
```

Backend: **http://127.0.0.1:8000**

### 2. Start React + Vite Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## 📊 Dataset Composition

| Category | Count | Source |
|----------|-------|--------|
| Human Admissions | 100 | Admitted Ivy League & State essays (2018–2023) |
| Pure AI Generated | 100 | GPT-4o, Claude 3.5, Gemini 1.5, Llama 3 |
| AI-Polished Hybrid | 50 | Human essays edited with ChatGPT |
| ESL Student Essays | 25 | International applicants |

See [DATASET_DOCUMENTATION.md](DATASET_DOCUMENTATION.md) for full sourcing details.
See [EVALUATION_REPORT.md](EVALUATION_REPORT.md) for held-out test results and 3 failure case post-mortems.

---

*Built with FastAPI + React + Vite · Statistical NLP · No LLM API Dependencies*
