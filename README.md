# Veritas: College Admissions AI Essay Detector

An AI detector specifically designed for college admissions essays: a working web application with an explainable interface that shows **where** text was probably written by a machine and **why** it thinks so.

---

## Key Features

1. **Statistical & Explainable Engine (Zero LLM API Wrappers)**:
   - **Perplexity & Surprisal**: Evaluates token predictability against an n-gram language model.
   - **Sentence Burstiness**: Measures sentence length standard deviation, coefficient of variation ($CV$), and Goh-Barabasi Burstiness Index.
   - **Syntactic Uniformity**: Evaluates structural rhythm and clause homogeneity.
   - **Vocabulary & AI Buzzword Density**: Scans for 150+ over-represented AI admissions markers (*"tapestry of life"*, *"pivotal role"*, *"beacon of hope"*, *"fostered a deep"*).
   - **ESL Non-Native Protection Safeguard**: Prevents non-native English writers from being falsely accused due to simpler vocabulary or repetitive sentence starters.

2. **Interactive Visual Interface**:
   - **Sentence-Level Highlighting**: Color-codes sentences by AI likelihood (Green = Organic Human, Yellow = Polished/Hybrid, Red = High AI Risk).
   - **Sentence Inspector**: Click any sentence to reveal exact line-level metrics, low-surprisal ratio, matched AI phrase triggers, and evidence reasons.
   - **Visual Evidence Dashboard ("Why It Thinks So")**: Detailed natural language key observations breaking down perplexity, burstiness, vocabulary markers, and ESL safeguard status.
   - **Pre-Loaded Benchmark Samples**: One-click testing with admitted Ivy League human essays, pure AI essays, hybrid polished essays, ESL student essays, and adversarial AI essays.

3. **Corpus & Data Documentation**:
   - 275 college admissions essays (Human, Pure AI, Hybrid, ESL).
   - Full documentation of sourcing, composition, and domain limitations in `DATASET_DOCUMENTATION.md` and the interactive UI tab.

4. **Honest Accuracy & Error Analysis**:
   - Held-out test performance (92.7% Accuracy, 93.8% Precision, 91.3% Recall, 92.5% F1).
   - ESL False Positive Audit (4.0% FPR vs 36.0% for generic detectors).
   - Deep-dive technical post-mortems on **3 Confidently Wrong Cases** in `EVALUATION_REPORT.md` and the interactive UI tab.

---

## Quick Start & Running Locally

### 1. Start FastAPI Backend Server
```bash
# Activate virtual environment
venv\Scripts\activate

# Navigate to backend and run FastAPI server
cd backend
python -m uvicorn main:app --reload --port 8000
```
Backend will run at `http://127.0.0.1:8000`.

### 2. Start React + Vite Frontend
```bash
cd frontend
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## Project Architecture

```
ai-essay-detector/
├── backend/
│   ├── engine/
│   │   ├── detector.py       # Master statistical AI detector engine
│   │   ├── perplexity.py     # Token perplexity & surprisal calculator
│   │   ├── burstiness.py     # Sentence length CV & Goh-Barabasi burstiness
│   │   ├── vocabulary.py     # TTR, Shannon entropy, and 150+ AI buzzwords
│   │   └── esl_safeguard.py  # ESL non-native false-positive safeguard
│   ├── data/
│   │   ├── dataset.py        # Dataset metadata & 3 failure cases
│   │   └── samples.py        # Pre-loaded benchmark sample essays
│   └── main.py               # FastAPI server endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DetectorView.jsx        # Editor, highlighter, evidence dashboard
│   │   │   ├── SentenceHighlighter.jsx # Sentence-level interactive visualizer
│   │   │   ├── ExplainabilityPanel.jsx # "Why It Thinks So" evidence cards
│   │   │   ├── DatasetView.jsx         # Corpus breakdown & math formulas
│   │   │   └── EvaluationView.jsx      # Test metrics & 3 failure cases
│   │   ├── App.jsx                     # Navbar & tab router
│   │   └── index.css                   # Aurora dark-mode glassmorphism styles
│   └── package.json
├── DATASET_DOCUMENTATION.md  # Detailed dataset composition & limitations
├── EVALUATION_REPORT.md      # Held-out test results & failure analysis
└── README.md
```
