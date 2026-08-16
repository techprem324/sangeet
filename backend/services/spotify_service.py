"""
spotify_service.py
==================
The "Brain" half of Sargam — Spotify's world-class ML audio features.

Spotify exposes precise *acoustic features* for every track:
  * valence      — musical positiveness (0 dark .. 1 bright)
  * energy       — intensity & speed (0 calm .. 1 frantic)
  * danceability — how danceable a track is

The NLP layer hands us target values for these; this service asks
Spotify for tracks that sit right on those targets. Crucially we do NOT
use Spotify for playback — only for *finding the right song* (title +
artist). Actual audio comes from the JioSaavn "Player" service.

When no SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET are configured (or the
library is missing), every method returns None/[] and the hybrid
pipeline falls back to the curated catalog + live JioSaavn search —
so the app works out of the box with zero keys.
"""

from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional

log = logging.getLogger("sargam.spotify")

_client = None
_configured = None


def _get_client():
    """Lazy spotipy client; None when unconfigured/unavailable."""
    global _client, _configured
    if _configured is not None:
        return _client

    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    if not (client_id and client_secret):
        log.info("Spotify not configured — using catalog/JioSaavn pipeline only")
        _configured = False
        return None
    try:
        import spotipy
        from spotipy.oauth2 import SpotifyClientCredentials
        _client = spotipy.Spotify(
            client_credentials_manager=SpotifyClientCredentials(
                client_id=client_id, client_secret=client_secret))
        _configured = True
    except Exception as exc:
        log.warning("Spotipy init failed: %s", exc)
        _configured = False
    return _client


def enabled() -> bool:
    return _get_client() is not None


def _norm(sp: "object", item: dict) -> Dict:
    """Normalize a Spotify track object into our standard track shape."""
    album = item.get("album") or {}
    artists = item.get("artists") or []
    return {
        "id": "spotify_" + item.get("id", ""),
        "source": "spotify",
        "title": item.get("name", ""),
        "artist": ", ".join(a.get("name", "") for a in artists),
        "album": album.get("name", ""),
        "cover": (album.get("images") or [{}])[0].get("url", "") if album.get("images") else "",
        "duration": int(item.get("duration_ms", 0) / 1000),
        "language": "",
        "year": album.get("release_date", "")[:4],
        "explicit": bool(item.get("explicit")),
        "has_lyrics": False,
        "stream_url": None,                 # filled by JioSaavn bridge
        "spotify_embed_url": "https://open.spotify.com/embed/track/" + item.get("id", ""),
    }


def search(query: str, limit: int = 5) -> List[Dict]:
    """Text search on Spotify (title/artist lookup)."""
    sp = _get_client()
    if not sp:
        return []
    try:
        res = sp.search(q=query, type="track", limit=limit)
        return [_norm(sp, t) for t in res.get("tracks", {}).get("items", [])]
    except Exception as exc:
        log.warning("Spotify search failed: %s", exc)
        return []


def recommendations(valence: float, energy: float, danceability: float,
                    seed_genres: Optional[List[str]] = None, limit: int = 6) -> List[Dict]:
    """
    Ask Spotify for tracks matching target acoustic features.

    `seed_genres` are the NLP-derived genre keywords (acoustic, sad-hindi,
    lofi, ...). Spotify only accepts a fixed genre taxonomy, so invalid
    seeds are filtered and the query degrades gracefully.
    """
    sp = _get_client()
    if not sp:
        return []
    try:
        genres = [g for g in (seed_genres or []) if g in (sp.recommendation_genre_seeds() or {}).get("genres", [])]
        params = dict(
            target_valence=valence, target_energy=energy,
            target_danceability=danceability, limit=limit,
            seed_genres=genres[:5] or None,
        )
        res = sp.recommendations(**params)
        return [_norm(sp, t) for t in res.get("tracks", [])]
    except Exception as exc:
        log.warning("Spotify recommendations failed: %s", exc)
        return []


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("spotify enabled:", enabled())
    if enabled():
        for t in recommendations(0.2, 0.3, 0.35, ["acoustic", "piano"]):
            print(" -", t["title"], "|", t["artist"])
