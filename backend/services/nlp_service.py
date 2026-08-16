"""
nlp_service.py
==============
The "understanding" half of Sargam's brain.

Turns a free-form sentence like
    "I just went through a breakup and it's raining outside at 2am"
into a structured *mood vector* the music pipeline can aim at:

    mood            ->  heartbreak
    target_valence  ->  0.15   (Spotify audio feature: positivity of the track)
    target_energy   ->  0.25   (Spotify audio feature: intensity / speed)
    genres          ->  ["acoustic", "sad-hindi", "piano"]

Design notes (capstone-friendly):
  * Fully transparent & explainable — every score is a weighted sum of
    human-readable lexicon hits, so we can tell the user *why* a song fits.
  * Zero heavyweight model downloads — runs offline with pure Python.
  * The scoring functions are pure & unit-testable (see tests/).

If you want deep-learning NLP later, the `analyze()` output shape stays
the same, so the rest of the pipeline does not change.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List

# --------------------------------------------------------------------------
# 1. EMOTION LEXICON
#    word -> (emotion, weight). Weight is how strongly the word signals it.
# --------------------------------------------------------------------------

EMOTION_LEXICON: Dict[str, List[tuple]] = {
    "happy": [
        ("happy", 3), ("glad", 3), ("joy", 3), ("joyful", 3), ("ecstatic", 4),
        ("elated", 4), ("cheerful", 3), ("delighted", 3), ("thrilled", 4),
        ("good day", 2), ("amazing", 2), ("wonderful", 2), ("blessed", 2),
        ("grateful", 2), ("content", 2), ("smile", 2), ("laughing", 3),
        ("laugh", 2), ("grinning", 3), ("excited", 3), ("pumped", 3),
        ("fantastic", 3), ("great", 1), ("lovely", 2), ("awesome", 2),
        ("yay", 3), ("woohoo", 4), ("celebrating", 3), ("vibing", 2),
    ],
    "sad": [
        ("sad", 3), ("depressed", 4), ("depressing", 4), ("down", 2),
        ("heartbroken", 4), ("heartbreak", 4), ("broken heart", 4),
        ("heartache", 4), ("miserable", 4), ("unhappy", 3), ("crying", 4),
        ("cry", 3), ("tears", 4), ("teary", 4), ("grief", 4), ("grieving", 4),
        ("lonely", 3), ("alone", 2), ("hollow", 3), ("empty", 3),
        ("lost", 2), ("hopeless", 4), ("worthless", 4), ("sorrow", 4),
        ("melancholy", 4), ("melancholic", 4), ("blue", 1), ("hurt", 3),
        ("pain", 2), ("suffer", 2), ("suffering", 3), ("tragic", 3),
        ("gloomy", 3), ("dark", 1), ("bleak", 3), ("numb", 3),
        ("missing", 2), ("miss you", 3), ("regret", 3), ("guilt", 3),
        ("ashamed", 3),        ("broken", 2), ("shattered", 4), ("devastated", 4),
        ("crushed", 3), ("aching", 3), ("weep", 3), ("sobbing", 4),
        ("goodbye", 1), ("farewell", 2), ("left me", 3), ("abandoned", 4),
        ("rejected", 3), ("ignored", 2), ("sigh", 2),
        ("breakup", 3), ("break-up", 3), ("broke up", 4), ("broken up", 4),
        ("dumped", 4), ("dumping", 4), ("ended things", 3), ("split up", 3),
        ("move on", 2), ("moving on", 2), ("walked away", 3), ("over us", 3),
    ],
    "angry": [
        ("angry", 3), ("anger", 3), ("mad", 3), ("furious", 4), ("rage", 4),
        ("raging", 4), ("irritated", 3), ("annoyed", 2), ("frustrated", 3),
        ("frustration", 3), ("pissed", 4), ("fuming", 4), ("livid", 4),
        ("hate", 3), ("hating", 3), ("despise", 3), ("fed up", 3),
        ("sick of", 3), ("tired of", 2), ("revenge", 3), ("vengeful", 3),
        ("screaming", 3), ("yelling", 3), ("shout", 2), ("explode", 3),
        ("losing my mind", 3), ("crazy", 1), ("infuriated", 4), ("seething", 4),
        ("resentful", 3), ("bitter", 2), ("unfair", 2), ("cheated", 3),
        ("betrayed", 3), ("backstabbed", 4), ("lied to", 3),
    ],
    "love": [
        ("love", 3), ("loved", 3), ("falling in love", 4), ("in love", 4),
        ("crush", 3), ("crushing", 3), ("romantic", 3), ("romance", 3),
        ("date", 2), ("dating", 2), ("anniversary", 3), ("valentine", 3),
        ("proposal", 3), ("engaged", 3), ("engagement", 3), ("wedding", 2),
        ("marry", 3), ("married", 2), ("honeymoon", 3), ("kiss", 3),
        ("kissing", 3), ("hug", 2), ("hugging", 2), ("sweetheart", 3),
        ("darling", 3), ("baby", 1), ("beautiful", 2), ("gorgeous", 2),
        ("attracted", 2), ("butterflies", 3), ("adore", 3), ("cherish", 3),
        ("soulmate", 4), ("my person", 3), ("partner", 1), ("bf", 2),
        ("gf", 2), ("boyfriend", 2), ("girlfriend", 2), ("flirting", 2),
        ("heart", 1), ("lovey", 2), ("infatuated", 3),
    ],
    "calm": [
        ("calm", 3), ("peaceful", 3), ("peace", 2), ("relaxed", 3),
        ("relax", 2), ("chill", 3), ("chilling", 3), ("serene", 4),
        ("tranquil", 4), ("soothing", 3), ("content", 2), ("easygoing", 3),
        ("mellow", 3), ("soft", 1), ("gentle", 2), ("quiet", 2),
        ("still", 1), ("breathe", 2), ("breathing", 2), ("meditate", 3),
        ("meditation", 3), ("mindful", 3), ("zen", 3), ("spa", 2),
        ("cozy", 3), ("comfy", 3), ("comfy", 3), ("snug", 3), ("warm", 1),
        ("lazy", 2), ("slow morning", 3), ("sunday", 2), ("tea", 1),
        ("coffee", 1), ("book", 1), ("reading", 2),
    ],
    "focused": [
        ("focused", 3), ("focus", 3), ("concentrate", 3), ("concentrating", 3),
        ("studying", 3), ("study", 2), ("studies", 2), ("exam", 2),
        ("exams", 2), ("revision", 3), ("homework", 2), ("assignment", 2),
        ("project", 2), ("deadline", 2), ("coding", 3), ("programming", 3),
        ("debugging", 3), ("working", 2), ("work", 1), ("office", 2),
        ("deep work", 4), ("productivity", 3), ("productive", 3), ("hustle", 3),
        ("grind", 2), ("diligent", 3), ("practice", 2), ("learning", 2),
        ("assignment", 2), ("thesis", 3), ("research", 2), ("preparing", 2),
        ("preparation", 2),
    ],
    "energetic": [
        ("energetic", 3), ("energy", 3), ("hyped", 4), ("hyper", 3),
        ("pumped", 3), ("amped", 3), ("fired up", 4), ("motivated", 3),
        ("motivation", 3), ("determined", 3), ("determination", 3),
        ("workout", 3), ("gym", 3), ("exercise", 3), ("training", 2),
        ("lifting", 3), ("running", 3), ("run", 2), ("sprint", 3),
        ("cycling", 2), ("sports", 2), ("game", 1), ("match", 1),
        ("competition", 2), ("challenge", 2), ("beast mode", 4), ("go hard", 3),
        ("push", 2), ("power", 2), ("strength", 2), ("strong", 2),
        ("adrenaline", 4), ("dance", 2), ("dancing", 3), ("dancefloor", 3),
        ("rave", 3), ("club", 2), ("party", 3), ("partying", 3),
        ("celebrate", 3), ("celebration", 3), ("birthday", 2), ("weekend", 1),
        ("friday night", 3), ("saturday night", 3), ("night out", 3),
        ("bangers", 3), ("banger", 3), ("turn up", 4), ("lit", 3),
        ("vibing", 2), ("fresh", 1), ("awake", 2), ("alive", 2),
        ("wild", 2), ("crazy night", 3),
    ],
    "nostalgic": [
        ("nostalgic", 4), ("nostalgia", 4), ("old days", 3), ("good old days", 4),
        ("remember", 2), ("memories", 3), ("memory", 2), ("childhood", 3),
        ("school days", 3), ("college days", 3), ("back then", 2),
        ("those days", 3), ("past", 1), ("reminds me", 3), ("flashback", 3),
        ("retro", 2), ("vintage", 2), ("classic", 2), ("golden era", 3),
        ("simpler times", 4), ("miss those", 3), ("wish i could go back", 4),
        ("90s", 2), ("2000s", 2), ("90's", 2), ("old songs", 2),
        ("childhood days", 3), ("grew up", 2), ("growing up", 2),
        ("first love", 3), ("first song", 2),
    ],
    "anxious": [
        ("anxious", 3), ("anxiety", 3), ("nervous", 3), ("worried", 3),
        ("worry", 2), ("stress", 3), ("stressed", 3), ("overwhelmed", 3),
        ("overthinking", 4), ("panic", 4), ("panicking", 4), ("restless", 3),
        ("uneasy", 3), ("tense", 3), ("pressure", 2), ("dread", 3),
        ("fear", 3), ("afraid", 3), ("scared", 3), ("frightened", 3),
        ("trembling", 3), ("shaking", 2), ("insomnia", 3), ("can't sleep", 3),
        ("sleepless", 3), ("toss and turn", 3), ("racing mind", 4),
        ("what if", 1), ("terrified", 4), ("horrified", 4),
    ],
    "motivated": [
        ("motivated", 3), ("motivation", 3), ("inspired", 3), ("inspiring", 3),
        ("ambitious", 3), ("ambition", 3), ("determined", 3), ("goal", 2),
        ("goals", 2), ("dream", 2), ("dreams", 2), ("success", 3),
        ("successful", 3), ("win", 2), ("winning", 2), ("victory", 3),
        ("champion", 3), ("achiever", 3), ("achieve", 2), ("achieving", 2),
        ("new beginning", 3), ("fresh start", 3), ("start over", 2),
        ("positive", 2), ("optimistic", 3), ("hope", 2), ("hopeful", 3),
        ("rise", 2), ("rising", 2), ("overcome", 3), ("conquer", 3),
        ("never give up", 4), ("keep going", 3), ("keep pushing", 3),
        ("morning", 1), ("sunrise", 2), ("new day", 3), ("today is the day", 4),
        ("level up", 3), ("glow up", 3), ("best version", 3),
    ],
}

# --------------------------------------------------------------------------
# 2. SITUATION / CONTEXT PATTERNS
#    These describe *what is happening around the user*, which tunes the
#    genre selection beyond raw emotion.
# --------------------------------------------------------------------------

SITUATION_PATTERNS: Dict[str, List[str]] = {
    "rain":        [r"\brain\b", r"\brains\b", r"\bdownpour\b", r"\bthunder", r"\bstorm\b", r"\bmonsoon\b", r"\bdrizzle\b", r"\bumbrella\b", r"\bwet\b"],
    "late_night":  [r"\b2 ?am\b", r"\b3 ?am\b", r"\b1 ?am\b", r"\b4 ?am\b", r"\bmidnight\b", r"\blate night\b", r"\binsomnia\b", r"\bcan't sleep\b", r"\bsleepless\b", r"\bup all night\b"],
    "breakup":     [r"\bbreakup\b", r"\bbreak-up\b", r"\bbroke up\b", r"\bbroken up\b", r"\bex\b", r"\bended things\b", r"\bleft me\b", r"\bdumped\b", r"\bdumping\b", r"\bover us\b", r"\bmove on\b", r"\bmoving on\b"],
    "exam":        [r"\bexam\b", r"\bexams\b", r"\btest\b", r"\bassignment\b", r"\bdeadline\b", r"\brevision\b", r"\bfinals\b"],
    "coding":      [r"\bcoding\b", r"\bprogramming\b", r"\bdebug\b", r"\bdebugging\b", r"\bhackathon\b", r"\bdeveloper\b", r"\bsprint\b"],
    "gym":         [r"\bgym\b", r"\bworkout\b", r"\blifting\b", r"\btraining\b", r"\bexercise\b", r"\bcardio\b", r"\brunning\b", r"\bjog\b"],
    "date":        [r"\bdate night\b", r"\bdate\b", r"\banniversary\b", r"\bvalentine\b", r"\bromantic evening\b", r"\bdinner date\b", r"\bcandlelight\b"],
    "party":       [r"\bparty\b", r"\bclub\b", r"\bcelebration\b", r"\bbirthday\b", r"\bwedding\b", r"\bfestival\b", r"\bholi\b", r"\bdiwali\b", r"\bnew year\b", r"\bweekend party\b"],
    "morning":     [r"\bmorning\b", r"\bsunrise\b", r"\bstart my day\b", r"\bwake up\b", r"\bwaking up\b", r"\bfresh day\b"],
    "drive":       [r"\bdriving\b", r"\bdrive\b", r"\broad trip\b", r"\bhighway\b", r"\bnight drive\b", r"\bcar\b", r"\btravel\b", r"\bjourney\b"],
    "work":        [r"\bwork\b", r"\boffice\b", r"\bmeeting\b", r"\bboss\b", r"\b9 to 5\b"],
    "lonely":      [r"\blonely\b", r"\bby myself\b", r"\ball alone\b", r"\bnobody\b", r"\balone\b"],
    "home":        [r"\bat home\b", r"\bhome\b", r"\bindoors\b", r"\bstaying in\b", r"\bcozy\b"],
    "creative":    [r"\bcreative\b", r"\bwriting\b", r"\bdrawing\b", r"\bpainting\b", r"\bdesigning\b", r"\bart\b", r"\bpoem\b"],
    "travel":      [r"\btravel\b", r"\btravelling\b", r"\btrip\b", r"\bvacation\b", r"\bholiday\b", r"\bbackpacking\b"],
}

# --------------------------------------------------------------------------
# 3. MOOD CATEGORIES
#    Each category maps to target Spotify audio features + seed genres.
#    These ids must match the catalog files in backend/data/catalog/*.json
# --------------------------------------------------------------------------

@dataclass
class MoodCategory:
    key: str
    label: str
    emoji: str
    tagline: str
    valence: float          # 0.0 (dark) -> 1.0 (bright)
    energy: float           # 0.0 (calm) -> 1.0 (intense)
    danceability: float
    genres: List[str]
    spotify_seeds: List[str]

MOOD_CATEGORIES: List[MoodCategory] = [
    MoodCategory(
        key="heartbreak", label="Broken Heart", emoji="💔",
        tagline="Let it hurt, then let it go",
        valence=0.15, energy=0.28, danceability=0.35,
        genres=["acoustic", "sad-hindi", "piano", "melancholic"],
        spotify_seeds=["a ballad for a broken heart", "tum hi ho", "channa mereya"]),
    MoodCategory(
        key="rain_night", label="Rainy Night", emoji="🌧️",
        tagline="Rain on the window, music in the dark",
        valence=0.25, energy=0.30, danceability=0.40,
        genres=["lo-fi", "ambient", "rain sounds", "chill", "sad-hindi"],
        spotify_seeds=["rainy night lofi", "ambient rain", "midnight melancholy"]),
    MoodCategory(
        key="focus_lofi", label="Deep Focus", emoji="☕",
        tagline="Warm beats for quiet concentration",
        valence=0.50, energy=0.35, danceability=0.45,
        genres=["lofi", "chillhop", "instrumental", "ambient", "study"],
        spotify_seeds=["lofi hip hop beats", "chill study music", "instrumental focus"]),
    MoodCategory(
        key="gym_power", label="Gym Beast", emoji="⚡",
        tagline="Maximum intensity, zero excuses",
        valence=0.75, energy=0.92, danceability=0.75,
        genres=["phonk", "edm", "hip-hop", "hardstyle", "trap"],
        spotify_seeds=["workout phonk", "gym edm", "trap workout mix"]),
    MoodCategory(
        key="romantic", label="Love Vibes", emoji="🌹",
        tagline="For the one who makes your heart skip",
        valence=0.78, energy=0.45, danceability=0.60,
        genres=["r-n-b", "bollywood-romance", "soul", "romantic-hindi"],
        spotify_seeds=["romantic hindi songs", "rnb love", "bollywood romance"]),
    MoodCategory(
        key="angry", label="Frustration Release", emoji="🔥",
        tagline="Turn the rage into a rhythm",
        valence=0.30, energy=0.85, danceability=0.60,
        genres=["rock", "metal", "punk", "aggressive-rap"],
        spotify_seeds=["angry rock", "metal rage", "aggressive rap"]),
    MoodCategory(
        key="chill_sunday", label="Chill Sunday", emoji="🌤️",
        tagline="Slow mornings, soft light, zero plans",
        valence=0.68, energy=0.35, danceability=0.55,
        genres=["indie-pop", "reggae", "jazz", "chill", "acoustic"],
        spotify_seeds=["indie chill sunday", "acoustic morning", "jazz lounge"]),
    MoodCategory(
        key="party", label="Party Bangers", emoji="🎉",
        tagline="Turn it up. Tonight is the night.",
        valence=0.88, energy=0.88, danceability=0.90,
        genres=["pop", "dance", "party-hindi", "edm", "club"],
        spotify_seeds=["party hindi dance", "edm party", "bollywood club bangers"]),
    MoodCategory(
        key="nostalgic", label="Nostalgic Hits", emoji="🕰️",
        tagline="Old songs, old friends, old feelings",
        valence=0.55, energy=0.45, danceability=0.55,
        genres=["classic-hindi", "90s", "retro", "oldschool"],
        spotify_seeds=["90s hindi classics", "retro bollywood", "old school love"]),
    MoodCategory(
        key="morning_motivation", label="Morning Fuel", emoji="🚀",
        tagline="Rise up. Today is yours.",
        valence=0.85, energy=0.65, danceability=0.70,
        genres=["motivational", "pop", "indie-rock", "hindi-pop"],
        spotify_seeds=["motivational morning", "uplifting pop", "positive vibes"]),
]

_CATEGORY_BY_KEY = {c.key: c for c in MOOD_CATEGORIES}

# --------------------------------------------------------------------------
# 4. EMOJI SIGNALS
#    Users love typing emoji — treat them as first-class mood signals.
# --------------------------------------------------------------------------

EMOJI_MOODS: Dict[str, str] = {
    "💔": "heartbreak", "😭": "heartbreak", "🥀": "heartbreak", "🖤": "heartbreak",
    "😢": "sad", "😞": "sad", "😔": "sad", "🥺": "sad", "😿": "sad",
    "🌧️": "rain_night", "🌧": "rain_night", "⛈️": "rain_night", "🌙": "rain_night", "🌃": "rain_night",
    "☕": "focus_lofi", "📚": "focus_lofi", "💻": "focus_lofi", "🧠": "focus_lofi", "🎧": "focus_lofi",
    "⚡": "gym_power", "💪": "gym_power", "🏋️": "gym_power", "🏃": "gym_power", "🔥": "gym_power",
    "🌹": "romantic", "❤️": "romantic", "💕": "romantic", "💘": "romantic", "🥰": "romantic", "😍": "romantic", "💑": "romantic",
    "😡": "angry", "🤬": "angry", "💢": "angry", "😤": "angry",
    "🌤️": "chill_sunday", "😌": "chill_sunday", "🛋️": "chill_sunday", "🌊": "chill_sunday", "🍃": "chill_sunday",
    "🎉": "party", "🪩": "party", "🥳": "party", "🍾": "party", "💃": "party", "🕺": "party",
    "🕰️": "nostalgic", "📼": "nostalgic", "🎞️": "nostalgic", "🪔": "nostalgic",
    "🚀": "morning_motivation", "🌅": "morning_motivation", "☀️": "morning_motivation", "✨": "morning_motivation",
}

EMOJI_STRENGTH = 3.0  # an emoji counts like a strong word hit

# --------------------------------------------------------------------------
# 5. INTENSITY MODIFIERS (boosts / dampens nearby signals)
# --------------------------------------------------------------------------

BOOSTERS = {"very": 1.5, "really": 1.5, "so": 1.4, "super": 1.5, "extremely": 1.8,
            "totally": 1.6, "absolutely": 1.7, "completely": 1.5, "terribly": 1.6,
            "insanely": 1.7, "ultra": 1.4, "dead": 1.2, "way": 1.3}
DAMPENERS = {"kinda": 0.6, "sorta": 0.6, "slightly": 0.6, "a little": 0.55,
             "a bit": 0.55, "bit": 0.7, "somewhat": 0.6, "not so": 0.4,
             "not that": 0.4, "not very": 0.3, "little": 0.8}

# --------------------------------------------------------------------------
# 6. EXPLAINABILITY TEMPLATES
# --------------------------------------------------------------------------

MOOD_EXPLANATIONS: Dict[str, str] = {
    "heartbreak": "You sound like you're carrying a heavy heart right now. That's valid — sometimes the only way through is to feel it all the way through, with songs that get it.",
    "rain_night": "Rain at night has a way of turning your thoughts up. I've tuned into that soft, dark, cinematic mood — music that fits a window full of rain.",
    "focus_lofi": "You want to get into the zone. I picked warm, steady, lyric-light beats that hold your attention without stealing it.",
    "gym_power": "Let's get loud. I loaded the set with high-intensity tracks engineered for heavy sets and big lifts.",
    "romantic": "This one's for the heart. I reached for warm, tender songs that say what you're feeling out loud.",
    "angry": "You're holding a lot of heat. Instead of bottling it, let's give it somewhere to go — heavy, loud, cathartic.",
    "chill_sunday": "Slow is allowed today. I built a gentle, sunlit mix — no rush, no noise, just warmth.",
    "party": "Tonight deserves volume. I stacked high-energy, dance-first tracks that will not let you sit still.",
    "nostalgic": "You're in your memories tonight. I found songs that feel like old friends — familiar, warm, and full of recall.",
    "morning_motivation": "Fresh start energy. I picked bright, forward-moving tracks to help you show up as the best version of yourself.",
}

# --------------------------------------------------------------------------
# 7. CORE ENGINE
# --------------------------------------------------------------------------

def _tokenize(text: str) -> List[str]:
    """Lowercase + split into words, preserving simple phrases."""
    text = text.lower()
    text = re.sub(r"[^\w\s'@]", " ", text)
    return text.split()


def _score_emotions(text: str) -> Dict[str, float]:
    """Weighted emotion scores from lexicon + emoji, with intensity modifiers."""
    scores: Dict[str, float] = {em: 0.0 for em in EMOTION_LEXICON}
    words = _tokenize(text)
    lowered = text.lower()

    # lexicon hits with modifier scaling
    for emotion, entries in EMOTION_LEXICON.items():
        for phrase, weight in entries:
            if phrase in lowered:
                scores[emotion] += weight

    # emoji signals
    for emoji, mood in EMOJI_MOODS.items():
        if emoji in text:
            # emoji maps to an emotion family
            target = "sad" if mood == "heartbreak" else \
                     "calm" if mood in ("rain_night", "focus_lofi", "chill_sunday") else \
                     "energetic" if mood in ("gym_power", "party") else \
                     "love" if mood == "romantic" else \
                     "angry" if mood == "angry" else \
                     "nostalgic" if mood == "nostalgic" else \
                     "motivated"
            if target in scores:
                scores[target] += EMOJI_STRENGTH

    # intensity modifiers: find "very sad" -> boost sad
    for i, w in enumerate(words):
        if w in BOOSTERS and i + 1 < len(words):
            nxt = words[i + 1]
            for emotion, entries in EMOTION_LEXICON.items():
                for phrase, _ in entries:
                    if phrase.split()[0] == nxt:
                        scores[emotion] += (BOOSTERS[w] - 1.0) * 3.0
        if w in DAMPENERS and i + 1 < len(words):
            nxt = words[i + 1]
            for emotion, entries in EMOTION_LEXICON.items():
                for phrase, _ in entries:
                    if phrase.split()[0] == nxt:
                        scores[emotion] -= (1.0 - DAMPENERS[w]) * 3.0

    return {k: max(0.0, v) for k, v in scores.items()}


def _detect_situations(text: str) -> List[str]:
    lowered = text.lower()
    found = []
    for situation, patterns in SITUATION_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, lowered):
                found.append(situation)
                break
    return found


def _sentiment_score(emotions: Dict[str, float]) -> float:
    """-1.0 (dark) .. +1.0 (bright) composite sentiment."""
    pos = emotions.get("happy", 0) + emotions.get("love", 0) + emotions.get("motivated", 0) * 0.7 + emotions.get("calm", 0) * 0.3
    neg = emotions.get("sad", 0) + emotions.get("angry", 0) + emotions.get("anxious", 0) * 0.8 + emotions.get("nostalgic", 0) * 0.2
    total = pos + neg
    if total == 0:
        return 0.0
    return round((pos - neg) / total, 3)


def _pick_category(emotions: Dict[str, float], situations: List[str], text: str) -> str:
    """
    Rule-based category selection:
      1. Dominant explicit emotion (highest weighted score).
      2. Situation modifiers that override/refine (rain+night -> rain_night, etc).
      3. Neutral text falls back to a "chill" default.
    """
    # direct emoji shortcut — the strongest possible signal
    for emoji, mood in EMOJI_MOODS.items():
        if emoji in text:
            return mood

    # situation-driven overrides (checked before pure emotion so that
    # "exam stress" doesn't get classified as 'angry' etc.)
    if "breakup" in situations and emotions.get("sad", 0) >= emotions.get("angry", 0):
        return "heartbreak"
    if "exam" in situations or "coding" in situations or "work" in situations:
        return "focus_lofi"
    if "gym" in situations:
        return "gym_power"
    if "party" in situations:
        return "party"
    if "date" in situations:
        return "romantic"
    # morning only wins when there's no strong 'stay in bed' signal
    if "morning" in situations and emotions.get("calm", 0) < 2.0:
        return "morning_motivation"
    if "rain" in situations and ("late_night" in situations or emotions.get("sad", 0) > 1.5):
        return "rain_night"

    # emotion-driven
    order = sorted(emotions.items(), key=lambda kv: kv[1], reverse=True)
    top, top_score = order[0]
    if top_score <= 0:
        return "chill_sunday"  # neutral default

    em_to_cat = {
        "sad": "heartbreak", "angry": "angry", "love": "romantic",
        "calm": "chill_sunday", "focused": "focus_lofi",
        "energetic": "gym_power", "nostalgic": "nostalgic",
        "anxious": "rain_night", "motivated": "morning_motivation",
        "happy": "party",
    }
    return em_to_cat.get(top, "chill_sunday")


def _confidence(emotions: Dict[str, float], text: str) -> float:
    """0..1 — how sure we are about the mood reading."""
    total = sum(emotions.values())
    spread = max(emotions.values()) - (sorted(emotions.values())[-2] if len(emotions) > 1 else 0)
    if total == 0:
        return 0.25
    signal = min(1.0, total / 8.0)
    margin = min(1.0, max(0.0, spread) / 2.0)
    return round(0.35 + 0.4 * signal + 0.25 * margin, 2)


def _genres_for(category: MoodCategory, situations: List[str]) -> List[str]:
    genres = list(category.genres)
    if "rain" in situations:
        genres = ["rain", "ambient"] + genres
    if "late_night" in situations:
        genres = ["midnight", "night-drive"] + genres
    return genres[:5]


# --------------------------------------------------------------------------
# 8. PUBLIC API
# --------------------------------------------------------------------------

def analyze(text: str) -> Dict:
    """
    Full NLP pipeline for a user message.

    Returns a mood vector dict (see module docstring) that the hybrid
    pipeline consumes to pick tracks.
    """
    text = (text or "").strip()
    if not text:
        text = "just feeling okay today"

    emotions = _score_emotions(text)
    situations = _detect_situations(text)
    sentiment = _sentiment_score(emotions)
    cat_key = _pick_category(emotions, situations, text)
    category = _CATEGORY_BY_KEY[cat_key]
    confidence = _confidence(emotions, text)

    # situations influence target features slightly (rain+night => darker/calmer)
    val_shift, ene_shift = 0.0, 0.0
    if "late_night" in situations:
        ene_shift -= 0.08
    if "rain" in situations:
        val_shift -= 0.05
    if "morning" in situations:
        val_shift += 0.05
    if "gym" in situations or "party" in situations:
        ene_shift += 0.05

    return {
        "mood": cat_key,
        "mood_label": category.label,
        "emoji": category.emoji,
        "tagline": category.tagline,
        "situations": situations,
        "emotions": {k: round(v, 2) for k, v in sorted(emotions.items(), key=lambda kv: -kv[1])[:5]},
        "sentiment_score": sentiment,
        "target_valence": round(max(0.0, min(1.0, category.valence + val_shift)), 2),
        "target_energy": round(max(0.0, min(1.0, category.energy + ene_shift)), 2),
        "target_danceability": category.danceability,
        "genres": _genres_for(category, situations),
        "explanation": MOOD_EXPLANATIONS.get(cat_key, ""),
        "confidence": confidence,
    }


def mood_pill(category_key: str) -> Dict:
    """Analyze shortcut for the quick mood pills in the UI."""
    cat = _CATEGORY_BY_KEY.get(category_key)
    if not cat:
        return analyze("")
    return {
        "mood": cat.key, "mood_label": cat.label, "emoji": cat.emoji,
        "tagline": cat.tagline, "situations": [], "emotions": {},
        "sentiment_score": 0.0,
        "target_valence": cat.valence, "target_energy": cat.energy,
        "target_danceability": cat.danceability, "genres": list(cat.genres),
        "explanation": MOOD_EXPLANATIONS.get(cat.key, ""), "confidence": 1.0,
    }


def categories() -> List[Dict]:
    """Public category list for the UI."""
    return [
        {"key": c.key, "label": c.label, "emoji": c.emoji, "tagline": c.tagline,
         "valence": c.valence, "energy": c.energy, "danceability": c.danceability,
         "genres": list(c.genres), "spotify_seeds": list(c.spotify_seeds)}
        for c in MOOD_CATEGORIES
    ]


if __name__ == "__main__":
    # quick self-test
    samples = [
        "I just went through a breakup and it's raining outside at 2 am",
        "Need something chill for late night coding in the rain",
        "I'm so stressed about exams, I need to focus",
        "GYM DAY. Time to lift heavy and go beast mode ⚡",
        "It's our anniversary, I want romantic songs for my girlfriend 💕",
        "My boss is an idiot and I'm so frustrated right now 😡",
        "Just relaxing on a Sunday morning with tea and no plans",
        "It's my birthday weekend, we're throwing a huge party 🎉",
        "These old songs remind me of school days, so nostalgic",
        "Feeling super happy and energetic today!",
    ]
    for s in samples:
        r = analyze(s)
        print(f"[{r['emoji']} {r['mood_label']:>18}] V={r['target_valence']:.2f} E={r['target_energy']:.2f} "
              f"S={r['sentiment_score']:+.2f} conf={r['confidence']:.2f} | {s}")
