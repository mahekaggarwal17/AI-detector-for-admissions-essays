import re
from typing import Dict, List, Tuple

from .perplexity import PerplexityAnalyzer
from .burstiness import BurstinessAnalyzer
from .vocabulary import VocabularyAnalyzer
from .esl_safeguard import ESLSafeguard


class AIDetectorEngine:
    """Master statistical AI detection engine combining explainable linguistic signals."""

    def __init__(self):
        self.perplexity_analyzer = PerplexityAnalyzer()
        self.burstiness_analyzer = BurstinessAnalyzer()
        self.vocabulary_analyzer = VocabularyAnalyzer()
        self.esl_safeguard = ESLSafeguard()

    def _split_sentences(self, text: str) -> List[str]:
        """Splits essay text into clean sentences."""
        # Normalize whitespace
        clean = re.sub(r'\s+', ' ', text.strip())
        if not clean:
            return []
        
        # Regex split on sentence boundaries
        raw_sentences = re.split(r'(?<=[.!?])\s+', clean)
        sentences = [s.strip() for s in raw_sentences if s.strip()]
        return sentences

    def analyze_essay(self, text: str) -> Dict:
        """Performs full document and sentence-level AI detection analysis."""
        sentences = self._split_sentences(text)
        
        if not sentences or len(text.strip()) < 30:
            return {
                "overall_ai_probability": 0.0,
                "overall_verdict": "Insufficient Text",
                "confidence_score": 0.0,
                "subscores": {
                    "perplexity_score": 0.0,
                    "burstiness_score": 0.0,
                    "syntactic_score": 0.0,
                    "ai_phrase_score": 0.0,
                },
                "stats": {},
                "esl_safeguard": {},
                "sentence_highlights": [],
                "evidence_summary": "Please paste a longer text passage (at least 2-3 sentences) for statistical analysis."
            }

        # 1. Component Analyses
        vocab_stats = self.vocabulary_analyzer.analyze(text)
        burst_stats = self.burstiness_analyzer.analyze(sentences)
        ppl_stats = self.perplexity_analyzer.analyze(sentences)
        esl_stats = self.esl_safeguard.analyze(text, vocab_stats, burst_stats)

        # 2. Extract Subscores (0 to 100)
        ppl_score = ppl_stats["perplexity_ai_score"]
        burst_score = burst_stats["burstiness_ai_score"]
        phrase_score = vocab_stats["ai_phrase_score"]

        # Syntactic Uniformity Subscore: combining low CV and low perplexity std dev
        cv = burst_stats["coefficient_of_variation"]
        ppl_std = ppl_stats["perplexity_std_dev"]
        syntactic_score = min(100.0, max(0.0, (0.50 - cv) * 100 + (15.0 - ppl_std) * 2.5))

        # 3. Weighted Master Ensemble Score
        # Weights:
        # Perplexity & Surprisal: 30%
        # Burstiness & Rhythm: 30%
        # AI Vocabulary & Transitions: 25%
        # Syntactic Homogeneity: 15%
        raw_master_score = (
            (ppl_score * 0.30) +
            (burst_score * 0.30) +
            (phrase_score * 0.25) +
            (syntactic_score * 0.15)
        )

        # Apply ESL Safeguard adjustment factor
        adj_factor = esl_stats["adjustment_factor"]
        final_ai_probability = round(min(99.9, max(0.1, raw_master_score * adj_factor)), 1)

        # 4. Verdict & Confidence
        if final_ai_probability >= 70.0:
            verdict = "Likely AI-Generated"
        elif final_ai_probability >= 38.0:
            verdict = "Mixed / AI-Polished"
        else:
            verdict = "Likely Human-Written"

        confidence_score = round(min(99.0, max(60.0, abs(final_ai_probability - 50.0) * 1.6 + 50.0)), 1)

        # 5. Sentence-Level Breakdown & Highlighting
        sentence_highlights = []
        for i, s_text in enumerate(sentences):
            s_words = re.findall(r'\b[a-zA-Z]+\b', s_text)
            w_count = len(s_words)
            
            s_ppl_info = self.perplexity_analyzer.calculate_sentence_perplexity(s_text)
            s_triggers = self.vocabulary_analyzer.analyze_sentence(s_text)
            
            # Local sentence AI probability
            # Factor 1: Low sentence perplexity
            s_ppl_penalty = max(0.0, (45.0 - s_ppl_info["perplexity"]) * 1.8)
            # Factor 2: High low-surprisal token ratio
            s_surp_penalty = s_ppl_info["low_surprisal_ratio"] * 35.0
            # Factor 3: Overused AI phrase trigger boost
            s_trigger_boost = len(s_triggers) * 28.0
            
            # Sentence length deviation from mean (low variance penalty)
            mean_len = burst_stats["mean_sentence_length"]
            s_len_dev = abs(w_count - mean_len)
            s_len_penalty = max(0.0, (10.0 - s_len_dev) * 3.0) if w_count > 0 else 0

            raw_s_score = (s_ppl_penalty * 0.35) + (s_surp_penalty * 0.25) + (s_trigger_boost * 0.25) + (s_len_penalty * 0.15)
            s_ai_prob = round(min(99.0, max(1.0, raw_s_score * adj_factor)), 1)

            if s_ai_prob >= 65.0:
                s_classification = "High AI Risk"
                highlight_color = "red"
            elif s_ai_prob >= 35.0:
                s_classification = "Moderate AI / Polished"
                highlight_color = "yellow"
            else:
                s_classification = "Likely Human"
                highlight_color = "green"

            sentence_highlights.append({
                "id": i,
                "text": s_text,
                "word_count": w_count,
                "ai_probability": s_ai_prob,
                "classification": s_classification,
                "highlight_color": highlight_color,
                "perplexity": s_ppl_info["perplexity"],
                "low_surprisal_ratio": s_ppl_info["low_surprisal_ratio"],
                "triggers": s_triggers,
                "reason": self._build_sentence_reason(s_ai_prob, s_ppl_info["perplexity"], s_triggers, w_count, mean_len)
            })

        # 6. Natural Language Evidence Summary
        evidence_summary = self._build_evidence_summary(
            final_ai_probability, verdict, vocab_stats, burst_stats, ppl_stats, esl_stats, sentence_highlights
        )

        return {
            "overall_ai_probability": final_ai_probability,
            "overall_verdict": verdict,
            "confidence_score": confidence_score,
            "subscores": {
                "perplexity_score": round(ppl_score, 1),
                "burstiness_score": round(burst_score, 1),
                "syntactic_score": round(syntactic_score, 1),
                "ai_phrase_score": round(phrase_score, 1),
            },
            "stats": {
                "total_words": vocab_stats["total_words"],
                "total_sentences": burst_stats["total_sentences"],
                "mean_sentence_length": burst_stats["mean_sentence_length"],
                "burstiness_index": burst_stats["burstiness_index"],
                "coefficient_of_variation": burst_stats["coefficient_of_variation"],
                "overall_perplexity": ppl_stats["overall_perplexity"],
                "perplexity_std_dev": ppl_stats["perplexity_std_dev"],
                "shannon_entropy": vocab_stats["shannon_entropy"],
                "ttr": vocab_stats["ttr"],
                "ai_phrase_triggers": vocab_stats["ai_phrase_triggers"],
                "ai_phrase_density": vocab_stats["ai_phrase_density"]
            },
            "esl_safeguard": esl_stats,
            "sentence_highlights": sentence_highlights,
            "evidence_summary": evidence_summary
        }

    def _build_sentence_reason(self, prob: float, ppl: float, triggers: List[str], w_count: int, mean_len: float) -> str:
        """Generates line-level evidence explanation for a sentence."""
        reasons = []
        if triggers:
            reasons.append(f"Contains AI buzzword triggers: {', '.join([f'\"{t}\"' for t in triggers[:2]])}")
        if ppl < 30.0:
            reasons.append(f"Unnaturally low token surprisal / perplexity ({ppl})")
        if abs(w_count - mean_len) < 3 and w_count > 12:
            reasons.append(f"Monotonous length ({w_count} words) aligned with overall uniform rhythm")
        
        if not reasons:
            if prob < 35.0:
                return "Natural, erratic human sentence rhythm with organic word choices."
            else:
                return "Slightly formulaic structure without strong AI phrase markers."
        
        return " | ".join(reasons) + "."

    def _build_evidence_summary(
        self, score: float, verdict: str, vocab: Dict, burst: Dict, ppl: Dict, esl: Dict, sentences: List[Dict]
    ) -> Dict:
        """Constructs structured multi-part explainable evidence report."""
        high_risk_count = sum(1 for s in sentences if s["highlight_color"] == "red")
        mod_risk_count = sum(1 for s in sentences if s["highlight_color"] == "yellow")
        total_s = len(sentences)

        key_observations = []

        # Observation 1: Rhythm & Burstiness
        cv = burst["coefficient_of_variation"]
        b_idx = burst["burstiness_index"]
        if cv < 0.38:
            key_observations.append({
                "category": "Sentence Rhythm & Burstiness",
                "status": "AI Indicator",
                "detail": f"Low length variance (CV = {cv:.2f}, Burstiness Index = {b_idx:.2f}). Sentences hover unnaturally around ~{burst['mean_sentence_length']:.0f} words without human punchy short sentences or sprawling compound sentences."
            })
        else:
            key_observations.append({
                "category": "Sentence Rhythm & Burstiness",
                "status": "Human Indicator",
                "detail": f"Healthy organic sentence variance (CV = {cv:.2f}, Burstiness Index = {b_idx:.2f}). Contains natural shifts between short narrative beats and longer descriptive clauses."
            })

        # Observation 2: Perplexity & Token Surprisal
        overall_ppl = ppl["overall_perplexity"]
        ppl_std = ppl["perplexity_std_dev"]
        if overall_ppl < 36.0 or ppl_std < 10.0:
            key_observations.append({
                "category": "Perplexity & Token Surprisal",
                "status": "AI Indicator",
                "detail": f"Unusually smooth token probabilities (Mean Perplexity = {overall_ppl:.1f}, SD = {ppl_std:.1f}). Words follow predictable language model paths with low surprisal spikes."
            })
        else:
            key_observations.append({
                "category": "Perplexity & Token Surprisal",
                "status": "Human Indicator",
                "detail": f"High word choice surprisal (Mean Perplexity = {overall_ppl:.1f}, SD = {ppl_std:.1f}). Exhibits idiosyncratic vocabulary choices and unpredictable turns of phrase."
            })

        # Observation 3: AI Buzzword & Transition Markers
        triggers = vocab["ai_phrase_triggers"]
        density = vocab["ai_phrase_density"]
        if density > 0.8:
            trig_names = [f"\"{t['phrase']}\"" for t in triggers[:4]]
            key_observations.append({
                "category": "Vocabulary & AI Markers",
                "status": "AI Indicator",
                "detail": f"High density of characteristic AI admissions cliches ({density:.1f} per 100 words), including {', '.join(trig_names)}."
            })
        else:
            key_observations.append({
                "category": "Vocabulary & AI Markers",
                "status": "Human Indicator",
                "detail": f"Low AI buzzword density ({density:.1f} per 100 words). Free from formulaic GPT admissions filler like 'tapestry of life' or 'testament to'."
            })

        # Observation 4: ESL Safeguard Status
        if esl["is_esl_candidate"]:
            key_observations.append({
                "category": "ESL Non-Native Protection",
                "status": "Safeguard Applied",
                "detail": esl["explanation"]
            })

        return {
            "verdict_title": f"{verdict} ({score}% AI Probability)",
            "sentence_distribution": f"{high_risk_count} High Risk, {mod_risk_count} Moderate/Polished, {total_s - high_risk_count - mod_risk_count} Organic Human out of {total_s} sentences.",
            "key_observations": key_observations
        }
