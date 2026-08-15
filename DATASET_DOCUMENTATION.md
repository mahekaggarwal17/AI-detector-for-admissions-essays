# College Admissions Essay Benchmark Dataset Documentation

## Overview
This document details the dataset used to train, calibrate, and validate the **Veritas AI Admissions Essay Detector**. The corpus contains **275 total essays** specifically focused on college personal statements and supplemental admissions prompts.

---

## Dataset Sourcing & Composition

| Category | Sample Count | Sourcing Methodology | Description & Purpose |
| :--- | :---: | :--- | :--- |
| **Human Original Admissions Essays** | **100** | Public admitted Ivy League & State university repositories (2018–2023) | Authentic student personal statements. Used to establish baseline human sentence burstiness, high perplexity variance, and organic storytelling narrative beats. |
| **Pure AI-Generated Essays** | **100** | Generated via zero-shot and few-shot prompts using GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and Llama 3 | Covers common admissions prompt themes (*"Overcoming Adversity"*, *"Why Engineering"*, *"Community Impact"*). Used to model low perplexity bands and uniform length distributions. |
| **AI-Polished Hybrid Essays** | **50** | Human original essays edited at paragraph or sentence level by ChatGPT | Simulates real-world student editing use cases, calibrating sentence-level localized probability scoring. |
| **ESL Student Human Essays** | **25** | International student applicants writing admissions essays in English as a Second Language | Critical validation set used to evaluate non-native English false-positive risk and calibrate ESL Protection Safeguards. |

---

## Dataset Split Strategy

- **Training / Calibration Set**: 180 essays (65.5%)
- **Validation Set**: 40 essays (14.5%)
- **Held-Out Test Set**: 55 essays (20.0%)

---

## Technical Features Extracted per Essay

1. **Token Perplexity ($PPL$) & Surprisal ($I(w)$)**: Evaluated via statistical n-gram language model calibrated on academic and admissions prose.
2. **Goh-Barabasi Burstiness Index ($B$)**: Measures standard deviation of sentence lengths normalized by mean length ($B = \frac{\sigma - \mu}{\sigma + \mu}$).
3. **Syntactic Uniformity Index ($U_{syn}$)**: Evaluates POS tag sequence repetition and clause length variance.
4. **Lexical Diversity & Entropy ($H(X)$)**: Root Type-Token Ratio (Guiraud's Index) and Shannon Entropy of vocabulary distribution.
5. **AI Buzzword & Transition Density**: Scans for 150+ over-represented AI admissions phrases (*"tapestry of life"*, *"pivotal role"*, *"beacon of hope"*, *"fostered a deep"*).
6. **ESL Protection Safeguard Index**: Identifies structural simplicity combined with organic burstiness and zero AI phrase density to protect non-native writers.

---

## Scope & Limitations

> [!IMPORTANT]
> **Domain Calibration**: This detector is calibrated specifically on undergraduate college admissions personal statements and supplemental essays.
> 
> **Limitations & What It Does Not Cover**:
> - STEM journal publications or technical lab reports (which naturally exhibit low vocabulary entropy and rigid passive voice syntax).
> - Non-narrative legal documents or tax codes.
> - High school creative writing poetry with extreme free-verse formats.
