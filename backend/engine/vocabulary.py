import re
import math
from typing import Dict, List, Set, Tuple

# Curated list of 150+ over-represented AI admissions essay phrases and buzzwords
AI_PHRASE_MARKERS = [
    # Classic AI transitions and filler openers
    "delve into", "delves into", "delving into", "delved into",
    "tapestry of", "tapestry of life", "rich tapestry", "woven into the tapestry",
    "testament to", "is a testament", "stands as a testament", "serves as a testament",
    "beacon of", "beacon of hope", "beacon of light",
    "fostered a deep", "fostering a deep", "fostered my", "fostering my passion",
    "pivotal role", "played a pivotal role", "pivotal moment", "pivotal turning point",
    "nestled in", "nestled within",
    "invaluable lessons", "invaluable experience", "invaluable insight",
    "underscore the importance", "underscores the importance",
    "vibrant tapestry", "vibrant ecosystem", "vibrant community",
    "profound impact", "profoundly shaped", "profound sense",
    "multifaceted", "multifaceted nature", "multifaceted challenge",
    "embark on a journey", "embarked on a journey", "journey of self-discovery",
    "relentless pursuit", "relentlessly pursue",
    "realm of", "in the realm of", "into the realm",
    "transformative journey", "transformative experience",
    "unwavering commitment", "unwavering dedication", "unwavering passion",
    "crucible of", "serves as a crucible",
    "symphony of", "harmonious blend",
    "shaping my perspective", "shaped my perspective",
    "deep-seated passion", "deeply ingrained",
    "bridge the gap", "bridging the gap",
    "indelible mark", "left an indelible mark",
    "crossroads of", "at the crossroads",
    "boundless opportunities", "boundless potential",
    "catalyst for growth", "catalyst for change",
    "cornerstone of my", "serves as the cornerstone",
    "furthermore", "moreover", "in conclusion", "to summarize",
    "in light of", "consequently", "nonetheless", "paradigm shift",
    "holistic approach", "synergy", "synergistic", "interdisciplinary approach",
    "meticulous", "meticulously", "seamlessly", "seamless integration",
    "resonate deeply", "resonates with me", "resonated with my",
    "sparked my curiosity", "ignited a fire", "ignited my passion",
    "passionate advocate", "fervent desire", "eager to contribute",
    "not only", "but also", "a testament to the fact", "it is worth noting",
    "in today's rapidly evolving world", "in an ever-changing world",
    "ever-evolving landscape", "dynamic world of",
    "unravel the complexities", "navigating the intricacies", "complexities of human",
    "broader perspective", "deeper understanding", "richer perspective",
    "cultivate a", "cultivating my", "cultivate meaningful",
    "plethora of", "myriad of", "multitude of", "array of",
    "beacon guiding", "compass pointing", "north star",
    "quilt of experiences", "mosaic of",
    "whispers of the past", "echoes of",
    "empower", "empowerment", "empowering communities",
    "illuminate the path", "illuminating the",
    "championing the cause", "zeal", "unflinching",
    "paragon of", "quintessential",
    "stepping stone towards", "stepping stone to",
    "catalyze", "architect of my own", "tapestry woven from",
    "unflinching resolve", "boundless curiosity",
    "inextricably linked", "intertwined with",
    "strive to make a meaningful", "leave a lasting impact"
]


class VocabularyAnalyzer:
    """Analyzes lexical richness, entropy, and AI vocabulary markers in text."""

    def __init__(self):
        self.ai_markers = set(phrase.lower() for phrase in AI_PHRASE_MARKERS)

    def analyze(self, text: str) -> Dict:
        """Performs full lexical analysis on the input text."""
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        total_words = len(words)

        if total_words == 0:
            return {
                "total_words": 0,
                "unique_words": 0,
                "ttr": 0.0,
                "adjusted_ttr": 0.0,
                "shannon_entropy": 0.0,
                "hapax_legomena_ratio": 0.0,
                "ai_phrase_triggers": [],
                "ai_phrase_density": 0.0,
                "ai_phrase_score": 0.0
            }

        unique_words = set(words)
        vocab_size = len(unique_words)

        # Type-Token Ratio (TTR)
        ttr = vocab_size / total_words

        # Root TTR (Guiraud's Index) to control for text length dependence
        adjusted_ttr = vocab_size / math.sqrt(total_words)

        # Word frequency distribution for Shannon Entropy
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1

        # Shannon Entropy
        entropy = 0.0
        for count in freq.values():
            p = count / total_words
            entropy -= p * math.log2(p)

        # Hapax Legomena (words occurring exactly once)
        hapax_count = sum(1 for count in freq.values() if count == 1)
        hapax_ratio = hapax_count / total_words

        # AI Phrase Trigger matching
        text_lower = text.lower()
        matched_phrases = []
        total_phrase_count = 0

        for phrase in self.ai_markers:
            # Match whole phrase or word boundary
            matches = len(re.findall(r'\b' + re.escape(phrase) + r'\b', text_lower))
            if matches > 0:
                matched_phrases.append({
                    "phrase": phrase,
                    "count": matches
                })
                total_phrase_count += matches

        # Sort matched phrases by frequency
        matched_phrases.sort(key=lambda x: x["count"], reverse=True)

        # Density per 100 words
        ai_phrase_density = (total_phrase_count / total_words) * 100

        # AI phrase score (0 to 100) based on trigger count & density
        raw_score = (ai_phrase_density * 25) + (len(matched_phrases) * 8)
        ai_phrase_score = min(100.0, max(0.0, raw_score))

        return {
            "total_words": total_words,
            "unique_words": vocab_size,
            "ttr": round(ttr, 4),
            "adjusted_ttr": round(adjusted_ttr, 4),
            "shannon_entropy": round(entropy, 4),
            "hapax_legomena_ratio": round(hapax_ratio, 4),
            "ai_phrase_triggers": matched_phrases[:15],
            "total_phrase_count": total_phrase_count,
            "ai_phrase_density": round(ai_phrase_density, 2),
            "ai_phrase_score": round(ai_phrase_score, 1)
        }

    def analyze_sentence(self, sentence_text: str) -> List[str]:
        """Returns AI phrase triggers present in a specific sentence."""
        sentence_lower = sentence_text.lower()
        found = []
        for phrase in self.ai_markers:
            if re.search(r'\b' + re.escape(phrase) + r'\b', sentence_lower):
                found.append(phrase)
        return found
