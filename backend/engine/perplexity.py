import math
import re
from typing import Dict, List, Tuple

# Pre-computed log-probabilities of common n-grams in human admissions vs AI admissions text
# Baseline human perplexity average is higher with wider distribution variance;
# Machine text concentrates in narrow, low-surprisal bands.

COMMON_WORD_TRANSITIONS = {
    # High-probability machine transitions (very low surprisal in AI models)
    ("in", "order", "to"): 0.85,
    ("played", "a", "pivotal"): 0.92,
    ("a", "testament", "to"): 0.94,
    ("delve", "into", "the"): 0.90,
    ("fostered", "a", "deep"): 0.88,
    ("a", "beacon", "of"): 0.89,
    ("rich", "tapestry", "of"): 0.91,
    ("journey", "of", "self"): 0.86,
    ("in", "conclusion", "my"): 0.88,
    ("not", "only", "did"): 0.84,
    ("shaping", "my", "understanding"): 0.87,
    ("underscores", "the", "importance"): 0.90,
    ("in", "today's", "world"): 0.89,
}

class PerplexityAnalyzer:
    """Calculates statistical perplexity, token surprisal, and surprisal variance."""

    def __init__(self):
        # Character 3-gram background frequencies calibrated on human prose corpus
        self.bg_char_3grams = {
            "the": 0.045, "ing": 0.028, "and": 0.022, "ion": 0.018, "ent": 0.015,
            "tio": 0.014, "for": 0.013, "ate": 0.012, "ter": 0.011, "ver": 0.010,
            "his": 0.009, "her": 0.009, "tha": 0.009, "res": 0.008, "con": 0.008
        }

    def _calculate_token_surprisal(self, words: List[str]) -> List[float]:
        """Calculates surprisal (-log2 P(w)) for each word in sequence."""
        if not words:
            return []
        
        surprisals = []
        for i, word in enumerate(words):
            # Base word surprisal based on length, frequency rank, and n-gram predictability
            word_len = len(word)
            
            # Contextual predictability check
            if i >= 2 and (words[i-2], words[i-1], word) in COMMON_WORD_TRANSITIONS:
                prob = COMMON_WORD_TRANSITIONS[(words[i-2], words[i-1], word)]
            elif i >= 1 and word in ["the", "a", "an", "and", "of", "to", "in", "that", "is", "was"]:
                prob = 0.35
            elif word_len > 9:
                prob = 0.015  # rarer/longer words have lower base probability
            elif word_len > 6:
                prob = 0.04
            else:
                prob = 0.12
            
            # Compute surprisal: I(w) = -log2(P(w))
            surprisal = -math.log2(max(prob, 1e-6))
            surprisals.append(surprisal)
            
        return surprisals

    def calculate_sentence_perplexity(self, sentence: str) -> Dict:
        """Calculates perplexity and surprisal stats for a single sentence."""
        words = re.findall(r'\b[a-zA-Z]+\b', sentence.lower())
        if not words:
            return {
                "word_count": 0,
                "perplexity": 50.0,
                "mean_surprisal": 5.0,
                "surprisal_variance": 0.0,
                "low_surprisal_ratio": 0.5
            }

        surprisals = self._calculate_token_surprisal(words)
        mean_surprisal = sum(surprisals) / len(surprisals)
        
        # Perplexity = 2 ^ mean_surprisal
        perplexity = math.pow(2, mean_surprisal)
        
        # Surprisal variance
        variance = sum((s - mean_surprisal) ** 2 for s in surprisals) / len(surprisals)
        
        # Ratio of tokens with very low surprisal (predictable machine tokens: < 3.0 bits)
        low_surprisal_count = sum(1 for s in surprisals if s < 3.2)
        low_surprisal_ratio = low_surprisal_count / len(surprisals)

        return {
            "word_count": len(words),
            "perplexity": round(perplexity, 2),
            "mean_surprisal": round(mean_surprisal, 3),
            "surprisal_variance": round(variance, 3),
            "low_surprisal_ratio": round(low_surprisal_ratio, 3)
        }

    def analyze(self, sentences: List[str]) -> Dict:
        """Analyzes overall text perplexity dynamics across all sentences."""
        if not sentences:
            return {
                "overall_perplexity": 45.0,
                "mean_sentence_perplexity": 45.0,
                "perplexity_std_dev": 0.0,
                "perplexity_ai_score": 50.0,
                "sentence_perplexities": []
            }

        sentence_results = [self.calculate_sentence_perplexity(s) for s in sentences]
        perplexities = [r["perplexity"] for r in sentence_results if r["word_count"] > 0]

        if not perplexities:
            return {
                "overall_perplexity": 45.0,
                "mean_sentence_perplexity": 45.0,
                "perplexity_std_dev": 0.0,
                "perplexity_ai_score": 50.0,
                "sentence_perplexities": []
            }

        mean_ppl = sum(perplexities) / len(perplexities)
        
        # Standard deviation of perplexity across sentences
        variance_ppl = sum((p - mean_ppl) ** 2 for p in perplexities) / len(perplexities)
        std_ppl = math.sqrt(variance_ppl)

        # AI Detection Scoring based on Perplexity:
        # Machine text has low average perplexity (typically < 35) and low std dev (< 10)
        # Human text has higher average perplexity (> 45) and high std dev (> 18)
        
        # 1. Low Mean Perplexity Penalty
        mean_penalty = max(0.0, (48.0 - mean_ppl) * 2.2)
        
        # 2. Uniformity (Low Std Dev) Penalty
        std_penalty = max(0.0, (16.0 - std_ppl) * 3.5)
        
        raw_ppl_score = mean_penalty + std_penalty
        perplexity_ai_score = min(100.0, max(0.0, raw_ppl_score))

        return {
            "overall_perplexity": round(mean_ppl, 2),
            "mean_sentence_perplexity": round(mean_ppl, 2),
            "perplexity_std_dev": round(std_ppl, 2),
            "perplexity_ai_score": round(perplexity_ai_score, 1),
            "sentence_perplexities": [r["perplexity"] for r in sentence_results]
        }
