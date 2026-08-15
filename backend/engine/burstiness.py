import math
import re
from typing import Dict, List

class BurstinessAnalyzer:
    """Analyzes sentence length variation, rhythm burstiness, and structural uniformity."""

    def analyze(self, sentences: List[str]) -> Dict:
        """Calculates burstiness metrics across a list of sentences."""
        if not sentences:
            return {
                "total_sentences": 0,
                "mean_sentence_length": 0.0,
                "sentence_length_std": 0.0,
                "coefficient_of_variation": 0.0,
                "burstiness_index": 0.0,
                "rhythm_score": 50.0,
                "burstiness_ai_score": 50.0,
                "sentence_lengths": []
            }

        # Calculate word count for each sentence
        sentence_lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
        valid_lengths = [l for l in sentence_lengths if l > 0]

        if not valid_lengths:
            return {
                "total_sentences": 0,
                "mean_sentence_length": 0.0,
                "sentence_length_std": 0.0,
                "coefficient_of_variation": 0.0,
                "burstiness_index": 0.0,
                "rhythm_score": 50.0,
                "burstiness_ai_score": 50.0,
                "sentence_lengths": []
            }

        n = len(valid_lengths)
        mean_len = sum(valid_lengths) / n

        # Standard Deviation
        variance = sum((l - mean_len) ** 2 for l in valid_lengths) / n
        std_len = math.sqrt(variance)

        # Coefficient of Variation (CV = σ / μ)
        cv = std_len / mean_len if mean_len > 0 else 0.0

        # Goh-Barabasi Burstiness Index B = (σ - μ) / (σ + μ)
        # B lies between -1 (perfectly periodic/uniform) and +1 (highly bursty)
        # Human writing: B > -0.15 (variable, punchy, bursty)
        # Machine writing: B < -0.35 (monotonously uniform, periodic sentence structures)
        denom = std_len + mean_len
        burstiness_index = (std_len - mean_len) / denom if denom > 0 else -1.0

        # Calculate 3-sentence sliding window variance (Rhythm Fluctuation)
        window_variances = []
        for i in range(len(valid_lengths) - 2):
            w = valid_lengths[i:i+3]
            w_mean = sum(w) / 3.0
            w_var = sum((x - w_mean) ** 2 for x in w) / 3.0
            window_variances.append(math.sqrt(w_var))

        avg_local_std = sum(window_variances) / len(window_variances) if window_variances else std_len

        # Scoring for AI Likelihood based on Burstiness:
        # Machine text has low CV (< 0.35) and low Burstiness Index (< -0.30)
        # Human text has high CV (> 0.55) and higher Burstiness Index (> -0.10)
        
        # 1. Low CV penalty (monotonous sentence length)
        cv_penalty = max(0.0, (0.55 - cv) * 140)
        
        # 2. Low Burstiness Index penalty
        b_penalty = max(0.0, (-0.12 - burstiness_index) * 110)
        
        raw_score = (cv_penalty * 0.5) + (b_penalty * 0.5)
        burstiness_ai_score = min(100.0, max(0.0, raw_score))

        return {
            "total_sentences": n,
            "mean_sentence_length": round(mean_len, 2),
            "sentence_length_std": round(std_len, 2),
            "coefficient_of_variation": round(cv, 4),
            "burstiness_index": round(burstiness_index, 4),
            "avg_local_std": round(avg_local_std, 2),
            "burstiness_ai_score": round(burstiness_ai_score, 1),
            "sentence_lengths": valid_lengths
        }
