"""
lyrics_service.py
=================
Line-synchronized lyrics (karaoke-style) for the player.

Primary source: **lrclib.net** — a free, community-maintained synced
lyrics database. Its LRC format carries a timestamp per line, which the
frontend uses to highlight the exact line while a song plays.

Fallback: JioSaavn's plain lyrics (no timestamps) when lrclib has no
match — the UI then shows the full text unscrolled.

LRC line format:
    [mm:ss.xx] line text
Parsed into:  { "t": seconds_float, "text": "..." }
"""

from __future__ import annotations

import logging
import os
import re
import threading
import time
from typing import Dict, List, Optional

import requests

from . import jiosaavn_service

log = logging.getLogger("sargam.lyrics")

LRCLIB = "https://lrclib.net/api"
APP_UA = "SangeetMusicApp/1.0 (capstone project; contact: student@example.com)"
TIMEOUT = 12
_TTL = int(os.getenv("LYRICS_CACHE_TTL", "86400"))

_cache: Dict[str, dict] = {}
_cache_lock = threading.Lock()

_LRC_LINE = re.compile(r"^\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$")


def _cache_get(key: str) -> Optional[dict]:
    with _cache_lock:
        e = _cache.get(key)
        if e and e["ts"] + _TTL > time.time():
            return e["value"]
    return None


def _cache_set(key: str, value: dict) -> None:
    with _cache_lock:
        _cache[key] = {"value": value, "ts": time.time()}
        if len(_cache) > 300:
            for k in sorted(_cache, key=lambda k: _cache[k]["ts"])[:60]:
                _cache.pop(k, None)


def _parse_lrc(lrc: str) -> List[Dict]:
    """Parse LRC text into [{t, text}] (seconds), skipping blank lines."""
    out: List[Dict] = []
    for raw in lrc.splitlines():
        m = _LRC_LINE.match(raw.strip())
        if not m:
            continue
        minutes, seconds, frac = int(m.group(1)), int(m.group(2)), m.group(3) or "0"
        frac = float(frac) / (10 ** len(frac)) if frac else 0.0
        text = m.group(4).strip()
        if not text:
            continue
        out.append({"t": round(minutes * 60 + seconds + frac, 2), "text": text})
    return out


def _fetch_lrclib(title: str, artist: str) -> Optional[Dict]:
    """Best-effort LRC lookup on lrclib.net."""
    try:
        q = {"artist_name": artist, "track_name": title}
        r = requests.get(f"{LRCLIB}/search", params=q, timeout=TIMEOUT,
                         headers={"User-Agent": APP_UA})
        r.raise_for_status()
        items = r.json()
        if not items:
            return None
        best = items[0]
        synced = best.get("syncedLyrics")
        if synced:
            return {"synced": True, "lines": _parse_lrc(synced),
                    "text": best.get("plainLyrics") or ""}
        plain = best.get("plainLyrics")
        if plain:
            return {"synced": False, "lines": [], "text": plain}
    except Exception as exc:
        log.warning("lrclib lookup failed for '%s - %s': %s", title, artist, exc)
    return None


def get_synced(title: str, artist: str = "", song_id: str = "") -> Dict:
    """
    Return { synced, lines, text, title } for a track.
    Tries lrclib (timed lines), then JioSaavn plain lyrics.
    """
    title = (title or "").strip()
    artist = (artist or "").strip()
    if not title and song_id:
        det = jiosaavn_service.get_details(song_id, resolve=False)
        if det:
            title, artist = det.get("title", ""), det.get("artist", "")
    if not title:
        return {"synced": False, "lines": [], "text": "", "title": ""}

    key = f"{title.lower()}|{artist.lower()}"
    cached = _cache_get(key)
    if cached is not None:
        return cached

    result = _fetch_lrclib(title, artist) or {"synced": False, "lines": [], "text": ""}
    if not result["text"] and song_id:
        result["text"] = jiosaavn_service.get_lyrics(song_id)
        # try to approximate timestamps by spreading lines across duration
        if result["text"] and result["synced"] is False:
            det = jiosaavn_service.get_details(song_id, resolve=False)
            dur = (det or {}).get("duration") or 0
            lines = [l for l in result["text"].replace("\r", "").split("\n") if l.strip()]
            if dur and lines:
                step = max(3.0, dur / max(len(lines), 1))
                result["lines"] = [{"t": round(i * step, 2), "text": l.strip()}
                                   for i, l in enumerate(lines)]
                result["synced"] = True
    result["title"] = title
    _cache_set(key, result)
    return result
