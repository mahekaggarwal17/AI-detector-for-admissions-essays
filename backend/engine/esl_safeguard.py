import re
from typing import Dict, List

# Characteristic non-native English (ESL) markers vs AI markers
# ESL applicants often write with:
# 1. High sentence length burstiness (natural human rhythm variance)
# 2. Simple vocabulary / repeated core nouns without AI hyper-flamboyant filler
# 3. Specific article/preposition structural quirks (e.g. "in the future day", "make me to feel", "study about", "very much excited")
# 4. LOW density of AI cliché transitions (no "tapestry of", "pivotal role", "beacon of hope")

ESL_IDIOMATIC_MARKERS = [
    "make me to", "learned me", "study about", "very much", "in that time",
    "from my childhood", "since my childhood", "give me an opportunity",
    "struggling with", "hard work for", "dream to become", "in my opinion",
    "i am writing this", "as a student of", "my father is", "my mother is",
    "in my school time", "during my study", "face many difficulties"
]

class ESLSafeguard:
    """Detects ESL non-native writing patterns and protects against false positive AI flags."""

    def analyze(self, text: str, vocabulary_stats: Dict, burstiness_stats: Dict) -> Dict:
        """Calculates ESL confidence index and returns adjusted AI probability."""
        text_lower = text.lower()
        words = re.findall(r'\b[a-zA-Z]+\b', text_lower)
        total_words = len(words) if words else 1

        # Count ESL structural markers
        esl_marker_count = 0
        for marker in ESL_IDIOMATIC_MARKERS:
            if marker in text_lower:
                esl_marker_count += 1

        # Key distinction metrics:
        # AI text has: LOW burstiness + HIGH AI phrase density + HIGH vocabulary smoothness
        # ESL text has: HIGH burstiness + LOW AI phrase density + SIMPLER vocabulary
        
        cv = burstiness_stats.get("coefficient_of_variation", 0.5)
        ai_phrase_density = vocabulary_stats.get("ai_phrase_density", 0.0)
        ttr = vocabulary_stats.get("ttr", 0.5)
        entropy = vocabulary_stats.get("shannon_entropy", 5.0)

        # ESL signal criteria:
        # 1. Low AI phrase density (< 0.8 per 100 words)
        # 2. Organic or high sentence burstiness (CV > 0.40)
        # 3. Presence of ESL markers or moderate TTR
        
        esl_score = 0.0
        
        if ai_phrase_density < 0.6:
            esl_score += 35.0
        elif ai_phrase_density < 1.2:
            esl_score += 15.0

        if cv > 0.45:
            esl_score += 35.0
        elif cv > 0.35:
            esl_score += 20.0

        if esl_marker_count >= 1:
            esl_score += 20.0

        if ttr < 0.48:  # slightly simpler/more repetitive vocabulary
            esl_score += 10.0

        esl_confidence = min(100.0, max(0.0, esl_score))

        # ESL Protection Factor:
        # If ESL confidence is high (> 60%) and AI phrase density is low,
        # reduce the raw AI score penalty so non-native English is not penalized!
        is_esl_candidate = esl_confidence > 55.0 and ai_phrase_density < 1.0
        
        adjustment_factor = 1.0
        if is_esl_candidate:
            # Scale down false positive flags by up to 50%
            reduction = (esl_confidence / 100.0) * 0.45
            adjustment_factor = max(0.45, 1.0 - reduction)

        return {
            "esl_confidence": round(esl_confidence, 1),
            "is_esl_candidate": is_esl_candidate,
            "esl_marker_count": esl_marker_count,
            "adjustment_factor": round(adjustment_factor, 2),
            "explanation": (
                "ESL Safeguard active: Sentence burstiness and organic phrasing detected without AI buzzword density. "
                "AI score adjusted to prevent false-positive flagging of non-native English writing."
                if is_esl_candidate else
                "Standard evaluation: Text profile does not show non-native English false-positive risk."
            )
        }
