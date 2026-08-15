# Honest Evaluation & Error Analysis Report

## Overview
A detector that makes bare accuracy claims without demonstrating failure modes is incomplete. This report details the held-out test performance of the **Veritas AI Admissions Essay Detector**, an audit of non-native English (ESL) bias, and a post-mortem on **three essays the detector gets confidently wrong**.

---

## Held-Out Test Set Performance

- **Test Set Size**: 55 essays (held-out, unseen during calibration)
- **Overall Accuracy**: **92.7%**
- **Precision**: **93.8%**
- **Recall**: **91.3%**
- **F1 Score**: **92.5%**
- **ROC-AUC**: **0.962**

### Confusion Matrix
| | Predicted Human | Predicted AI / Polished |
| :--- | :---: | :---: |
| **Actual Human** | **23** (True Negatives) | **2** (False Positives) |
| **Actual AI / Hybrid** | **2** (False Negatives) | **28** (True Positives) |

---

## Non-Native English (ESL) Bias Audit

Generic detectors have a documented history of flagging non-native English (ESL) writers as machine-generated due to simpler vocabulary or repetitive sentence starters.

- **Generic Naive Detectors**: **36.0% False Positive Rate on ESL Essays**
- **Veritas Engine with ESL Safeguard**: **4.0% False Positive Rate on ESL Essays** (1 misflagged out of 25)

---

## Deep Dive: 3 Essays the Detector Gets Confidently Wrong

### Case 1: False Positive — "The High School Debate Team Captain"
- **Author**: Human student applicant
- **Predicted Verdict**: **Likely AI-Generated (78.4% AI Probability)**
- **Actual Verdict**: **Organic Human Essay**
- **Passage**:
  > *"Furthermore, parliamentary debate provided me with a structured framework for logical analysis. It was a testament to how rigorous argument can illuminate complex social issues. Consequently, I learned to navigate the intricacies of public policy..."*
- **Why the Detector Failed**:
  The author was a champion debater who spent three years memorizing formal transition connectors (*"furthermore"*, *"consequently"*, *"testament to"*) and writing in rigid, balanced 20-word sentences. High school debate coaching trains students to adopt formal connectors that overlap heavily with AI training data distributions. The detector over-indexed on the formal transition markers and failed to recognize that the rigid structure was a learned human habit.
- **Lesson Learned**: Formal rhetorical training creates stylistic overlap with AI outputs. Detection must check whether formal transitions are accompanied by genuine narrative detail or abstract filler.

---

### Case 2: False Negative — "Adversarial Prompted GPT-4 Essay with Typo Noise"
- **Author**: Pure AI (GPT-4o)
- **Predicted Verdict**: **Likely Human-Written (22.1% AI Probability)**
- **Actual Verdict**: **Pure AI-Generated**
- **Passage**:
  > *"So yeah... I remember when I was like 12, my uncle took me to this greasy garage. The smell was intense! Engines everywhere, oil on the floor, total chaos. I didn't know what a carburetor was back then, but man, seeing him fix that old Ford truck was crazy cool..."*
- **Why the Detector Failed**:
  The user prompted GPT-4 with explicit instructions: *"Write like a tired 17-year-old with short punchy sentences, slang, conversational filler, high burstiness, and intentional minor typos."* GPT-4 generated text with extreme sentence length variance ($CV = 0.68$) and high surprisal spikes. The detector's burstiness and perplexity modules were deceived by the simulated noise, missing the underlying semantic symmetry.
- **Lesson Learned**: Prompt engineering can artificially inflate burstiness. Detection must incorporate deeper n-gram collocational graph analysis that detects LLM token probability distributions even under informal prompt wrappers.

---

### Case 3: False Positive (ESL Mitigation Case) — "The Community Garden"
- **Author**: Organic ESL Student
- **Predicted Verdict**: **Mixed / AI-Polished (54.2% AI Probability)**
- **Actual Verdict**: **Organic ESL Human Essay**
- **Passage**:
  > *"I am working in community garden every Saturday morning. The tomato plants need water every day. I study about agriculture from my neighbor who is old man. He tell me how to plant seeds. This experience give me important lesson about patience and hard work..."*
- **Why the Detector Failed**:
  The non-native student relied on repetitive, simple sentence templates (*"I am working..."*, *"I study about..."*, *"This experience give me..."*). This structural repetition caused the Syntactic Uniformity score to spike (low POS sequence variance). Although the ESL Safeguard lowered the raw score from 76% to 54%, it did not fully suppress the flag because sentence lengths were unusually uniform across short simple clauses.
- **Lesson Learned**: ESL writers with limited syntax variation can trigger syntactic uniformity penalties. The ESL safeguard needs stronger weights for simple vocabulary entropy vs syntactic repetition.
