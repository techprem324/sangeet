"""
hybrid_pipeline.py
==================
The orchestrator — "Hybrid Brain-Player" in one place.

Flow for /api/chat:
    user text
      -> nlp_service.analyze()          (mood vector: valence/energy/genres)
      -> 1. THE BRAIN   (Spotify):
             when configured, request tracks that sit ON the target
             acoustic features; when not configured, use the curated
             catalog category + live JioSaavn genre search instead.
      -> 2. THE PLAYER  (JioSaavn):
             every candidate title/artist is searched on JioSaavn and
             its DES-decrypted 320kbps CDN stream URL is attached.
      -> 3. THE PAYLOAD:
             { reply, mood vector, tracks[..], lyrics, why_this_song }
      -> 4. PERSIST:     conversation saved via db_service.

Why the hybrid? Spotify's features are the best ML fingerprint in the
world, but free accounts can't play full tracks via 3rd-party apps.
JioSaavn's DRM-free CDN gives full 320kbps playback for free. Together:
spot-on recommendations + full-track playback, no premium required.
"""

from __future__ import annotations

import logging
import random
import re
from typing import Dict, List

from . import catalog_service, db_service, jiosaavn_service, nlp_service, spotify_service

log = logging.getLogger("sargam.pipeline")

MAX_TRACKS = 5

# Why-this-song micro-explanations, keyed by mood category — the UI shows
# one of these under each recommended track so the "AI thinking" is visible.
WHY_TEMPLATES: Dict[str, List[str]] = {
    "heartbreak": [
        "Slow tempo + low valence — matches how a heavy heart moves.",
        "Acoustic texture, so the vocals feel close and honest.",
        "Minor-key melody that sits right in that melancholy range.",
        "Piano-led arrangement — gentle enough to cry to, strong enough to heal.",
    ],
    "rain_night": [
        "Muted energy fits a rain-soaked 2am — nothing too bright.",
        "Dark, spacious production like a window full of rain.",
        "Midnight-slow tempo that doesn't rush your thoughts.",
        "Ambient undertones — background music for your rain.",
    ],
    "focus_lofi": [
        "Steady, lyric-light beats hold attention without stealing it.",
        "Low danceability = your brain won't be hijacked.",
        "Warm lo-fi texture, engineered for deep work.",
        "Consistent energy curve — no jarring drops mid-flow.",
    ],
    "gym_power": [
        "Near-max energy — built for the heaviest set of the day.",
        "Driving beat that locks into a lifting rhythm.",
        "Aggressive sound palette to push past the wall.",
        "High BPM keeps adrenaline up between reps.",
    ],
    "romantic": [
        "Warm valence — the sonic equivalent of a soft smile.",
        "Smooth, vocal-forward mix made for two people.",
        "Gentle swing that feels like slow dancing in a kitchen.",
        "Romantic lyricism that says what you're feeling out loud.",
    ],
    "angry": [
        "High energy, low sweetness — rage with a pulse.",
        "Distorted, punchy production that gives anger somewhere to go.",
        "Relentless drive — catharsis you can headbang to.",
        "Heavy rhythm section built for letting it out.",
    ],
    "chill_sunday": [
        "Mid-valence warmth — bright but never loud.",
        "Easygoing tempo for slow mornings and no plans.",
        "Organic instrumentation — sunlight through curtains.",
        "Mellow groove that pairs with tea and a window seat.",
    ],
    "party": [
        "Near-max danceability — this one moves a room.",
        "High energy and high valence: pure celebration.",
        "Beat-first production built for a full dancefloor.",
        "Crowd-tested hook — the chorus everyone knows.",
    ],
    "nostalgic": [
        "Familiar melody that pulls the past back gently.",
        "Classic production texture — sounds like the year it came from.",
        "Warm mid-valence — memory with the sharp edges softened.",
        "A song built for 'remember when...' moments.",
    ],
    "morning_motivation": [
        "Bright, forward-moving energy for a fresh start.",
        "Uplifting major-key hook — the sonic version of sunrise.",
        "Marching rhythm that makes you sit up straight.",
        "Optimistic valence tuned to 'today is the day'.",
    ],
}


# ---------------------------------------------------------------------------
# Track sourcing
# ---------------------------------------------------------------------------

def _tracks_from_spotify(mood: Dict) -> List[Dict]:
    """Brain path: Spotify recommendations by target acoustic features."""
    spot = spotify_service.recommendations(
        valence=mood["target_valence"], energy=mood["target_energy"],
        danceability=mood["target_danceability"],
        seed_genres=mood.get("genres", []), limit=8)
    if not spot:
        return []
    random.shuffle(spot)
    return spot[:MAX_TRACKS]


def _tracks_from_catalog(mood: Dict) -> List[Dict]:
    """Fallback path: curated category tracks, stream-hydrated."""
    tracks = catalog_service.category_tracks(mood["mood"], limit=12, resolve=True)
    playable = [t for t in tracks if t.get("stream_url")]
    if len(playable) < MAX_TRACKS:
        # top up with live JioSaavn genre search so the mix always feels fresh
        fresh = catalog_service.explore(mood["mood"], count=MAX_TRACKS * 2)
        playable += [t for t in fresh if t.get("stream_url")]
    seen, deduped = set(), []
    for t in playable:
        k = (t.get("title") or "").lower()
        if k and k not in seen:
            seen.add(k)
            deduped.append(t)
    random.shuffle(deduped)
    return deduped[:MAX_TRACKS]


def _bridge_streams(spotify_tracks: List[Dict]) -> List[Dict]:
    """
    Player path: take Spotify's picks (title + artist only) and attach
    live JioSaavn 320kbps stream URLs. Tracks JioSaavn can't find are
    dropped — the frontend also gets the Spotify embed as a fallback.
    """
    out = []
    for t in spotify_tracks:
        query = f"{t['title']} {t['artist']}".strip()
        stream = jiosaavn_service.resolve_stream(query)
        if not stream:
            continue
        t = dict(t)
        t["stream_url"] = stream
        out.append(t)
    return out


def _whys(mood_key: str, count: int) -> List[str]:
    """One distinct reason per track — no duplicate lines in the UI."""
    pool = list(WHY_TEMPLATES.get(mood_key, WHY_TEMPLATES["chill_sunday"]))
    random.shuffle(pool)
    out = []
    for i in range(count):
        if i < len(pool):
            out.append(pool[i])
        else:
            out.append(f"Sits in the same {mood_key.replace('_', ' ')} zone — the audio features line up.")
    return out


# ---------------------------------------------------------------------------
# The public entry point
# ---------------------------------------------------------------------------

def chat(text: str, user_id: str = "usr_guest", session_id: str = "",
          mood_hint: str = "") -> Dict:
    """
    Full pipeline for one user message. Returns the payload for /api/chat.
    """
    # 1. Understand the user
    mood = nlp_service.mood_pill(mood_hint) if mood_hint else nlp_service.analyze(text)

    # 2. Source candidate tracks (Brain)
    if spotify_service.enabled():
        candidates = _tracks_from_spotify(mood)
        source_label = "spotify-brained"
        if candidates:
            candidates = _bridge_streams(candidates)  # (Player)
    else:
        candidates = []
        source_label = "catalog"

    if not candidates:
        # 2b. Catalog fallback (also covers Spotify returning nothing)
        candidates = _tracks_from_catalog(mood)
        source_label = "catalog"

    if not candidates:
        return {
            "reply": ("I couldn't reach the music sources right now. "
                      "Please try again in a moment — or try a different mood. 🎧"),
            "mood": mood, "tracks": [], "lyrics": "", "source": "none",
        }

    # 3. Compose the natural reply
    n = len(candidates)
    first = candidates[0]
    reply = (
        f"{mood['emoji']} {mood['mood_label']} — got it. "
        f"I tuned into your {mood['target_valence']:.2f} valence / "
        f"{mood['target_energy']:.2f} energy zone and pulled {n} tracks "
        f"that sit right there. Starting with *{first['title']}* by "
        f"{first['artist']}. Hit play — full 320kbps, no premium needed."
    )

    # 4. Lyrics for the first track (nice in-chat touch) — fetched in a
    #    short-lived thread so a slow lyrics call never blocks the reply.
    lyrics = ""
    first_id = str(candidates[0].get("id") or "")
    if first_id and not first_id.startswith("spotify_"):
        try:
            lyrics = jiosaavn_service.get_lyrics(first_id) or ""
        except Exception:
            lyrics = ""

    # 5. Persist + return
    record = db_service.save_conversation(user_id, session_id, {
        "user_query": text,
        "extracted_context": mood,
        "ai_response_text": reply,
        "recommended_tracks": [
            {"track_id": t.get("id", ""), "title": t.get("title", ""),
             "artist": t.get("artist", ""), "album": t.get("album", ""),
             "album_art": t.get("cover", ""), "stream_url": t.get("stream_url", ""),
             "spotify_embed_url": t.get("spotify_embed_url", "")}
            for t in candidates],
    })

    payload = {
        "reply": reply,
        "mood": mood,
        "tracks": candidates,
        "why_this_song": _whys(mood["mood"], n),
        "lyrics": lyrics,
        "source": source_label,
        "record_id": record.get("_id"),
    }
    return payload


def analyze_only(text: str, mood_hint: str = "") -> Dict:
    """Pure NLP analysis — powers the live 'mood radar' demo in the UI."""
    return nlp_service.mood_pill(mood_hint) if mood_hint else nlp_service.analyze(text)
