import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from engine.detector import AIDetectorEngine
from data.samples import SAMPLE_ESSAYS
from data.dataset import DATASET_METADATA, EVALUATION_METRICS, CONFIDENTLY_WRONG_CASES

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data

def test_get_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) == len(SAMPLE_ESSAYS)

def test_get_dataset():
    response = client.get("/api/dataset")
    assert response.status_code == 200
    data = response.json()
    assert "total_essays" in data
    assert "categories" in data

def test_get_evaluation():
    response = client.get("/api/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "confidently_wrong_cases" in data

def test_analyze_samples():
    for s in SAMPLE_ESSAYS:
        response = client.post("/api/analyze", json={"text": s["text"]})
        assert response.status_code == 200
        data = response.json()
        assert "overall_ai_probability" in data
        assert "overall_verdict" in data
        assert "confidence_score" in data
        assert "subscores" in data
        assert "stats" in data
        assert "esl_safeguard" in data
        assert "sentence_highlights" in data
        assert "evidence_summary" in data

        # Check subscores structure
        sub = data["subscores"]
        assert "perplexity_score" in sub
        assert "burstiness_score" in sub
        assert "syntactic_score" in sub
        assert "ai_phrase_score" in sub

        # Check evidence summary structure
        ev = data["evidence_summary"]
        assert "verdict_title" in ev
        assert "sentence_distribution" in ev
        assert "key_observations" in ev
        assert isinstance(ev["key_observations"], list)

def test_analyze_edge_cases():
    # Short input under 10 chars should return 400
    short_res = client.post("/api/analyze", json={"text": "Hi"})
    assert short_res.status_code == 400

    empty_res = client.post("/api/analyze", json={"text": ""})
    assert empty_res.status_code == 400

    # Short input between 10 and 29 chars
    short_sentence = client.post("/api/analyze", json={"text": "This is ten chars plus."})
    assert short_sentence.status_code == 200
    data = short_sentence.json()
    assert data["overall_verdict"] == "Insufficient Text"

def test_detector_engine_special_characters():
    engine = AIDetectorEngine()
    
    # Text with numbers, abbreviations, quotes, apostrophes
    text = 'At 4:00 AM, Mr. Smith said "Hello world!" Isn\'t it great? We analyzed 3.14 items.'
    res = engine.analyze_essay(text)
    assert res is not None
    assert "overall_ai_probability" in res
    assert isinstance(res["sentence_highlights"], list)

def test_detector_engine_no_division_by_zero():
    engine = AIDetectorEngine()
    res = engine.analyze_essay("a " * 50)
    assert res is not None
    assert not any(val is None for val in res["subscores"].values())
