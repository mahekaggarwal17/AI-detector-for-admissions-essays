import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional

# Ensure the backend directory is in sys.path regardless of how the script is invoked
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from engine.detector import AIDetectorEngine
from data.samples import SAMPLE_ESSAYS
from data.dataset import DATASET_METADATA, EVALUATION_METRICS, CONFIDENTLY_WRONG_CASES

app = FastAPI(
    title="College Admissions AI Detector API",
    description="Statistical, explainable AI detector engine based on perplexity, burstiness, n-gram entropy, and ESL protection.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = AIDetectorEngine()

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Admissions Detector Engine API",
        "version": "1.0.0"
    }

@app.post("/api/analyze")
def analyze_essay(payload: AnalyzeRequest):
    """Performs full statistical AI detection on essay text."""
    if not payload.text or len(payload.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short. Please provide at least 2-3 sentences.")
    
    result = detector.analyze_essay(payload.text)
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
