"""
jiosaavn_service.py
===================
The "Player" half of Sargam's brain.

JioSaavn does not ship a public API, but its web client talks to an
internal JSON API at `www.jiosaavn.com/api.php`. Two interesting facts:

1. The search endpoint returns every song's metadata — including a
   *direct, DRM-free CDN link* to the audio file. That link is hidden
   inside `encrypted_media_url`, a Base64 string.
2. That string is DES-ECB encrypted with the 8-byte key `38346591`
   (publicly documented by the open-source community). Decrypting it
   yields the CDN path, e.g.
       https://aac.saavncdn.com/430/5c5ea5cc..._96.mp4
   Swapping the bitrate token `_96` -> `_320` gives the 320 kbps master.

The CDN (aac.saavncdn.com) serves the file with
`Access-Control-Allow-Origin: *` and byte-range support, so a browser
can stream it directly via a plain <audio> tag — no proxy required.

The endpoint & key are community-documented; they may change, so every
network call is wrapped in try/except and the pipeline has a curated
catalog fallback (see catalog_service.py).

Module layout
-------------
  * search()           -> normalized song list from a text query
  * get_details()      -> rich details incl. lyrics for one song id
  * resolve_stream()   -> live 320kbps URL for a query or song id
  * resolve_many()     -> batch resolution with an LRU cache
"""

from __future__ import annotations

import base64
import html
import logging
import os
import re
import threading
import time
from typing import Dict, List, Optional

import requests
from Crypto.Cipher import DES

log = logging.getLogger("sargam.jiosaavn")

API_BASE = "https://www.jiosaavn.com/api.php"
DES_KEY = b"38346591"                 # community-documented decryption key
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
MAX_BITRATE = 320
TIMEOUT = 15

# stream resolution cache ----------------------------------------------------
_cache: Dict[str, dict] = {}
_cache_lock = threading.Lock()
_CACHE_TTL = int(os.getenv("STREAM_CACHE_TTL", "3600"))


def _get_cache(key: str) -> Optional[dict]:
    with _cache_lock:
        entry = _cache.get(key)
        if entry and entry["ts"] + _CACHE_TTL > time.time():
            return entry["value"]
    return None


def _set_cache(key: str, value: dict) -> None:
    with _cache_lock:
        _cache[key] = {"value": value, "ts": time.time()}
        if len(_cache) > 600:  # simple cap
            oldest = sorted(_cache, key=lambda k: _cache[k]["ts"])[:200]
            for k in oldest:
                _cache.pop(k, None)


def _api(call: str, params: dict) -> Optional[dict]:
    """Low-level call to the JioSaavn internal JSON API."""
    params = {"__call": call, "_format": "json", "_marker": "0", **params}
    try:
        resp = requests.get(API_BASE, params=params, timeout=TIMEOUT,
                            headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:  # network, HTTP, JSON errors — all non-fatal
        log.warning("JioSaavn %s failed: %s", call, exc)
        return None


# ---------------------------------------------------------------------------
# Decryption
# ---------------------------------------------------------------------------

def decrypt_media_url(encrypted: str) -> Optional[str]:
    """
    Decrypt a JioSaavn `encrypted_media_url` (DES-ECB, key `38346591`).

    Returns the full CDN URL at the bitrate the API handed us, or None.
    """
    if not encrypted:
        return None
    try:
        raw = DES.new(DES_KEY, DES.MODE_ECB).decrypt(base64.b64decode(encrypted))
        pad = raw[-1]                      # PKCS#5 padding length
        if pad and pad <= 8:
            raw = raw[:-pad]
        path = raw.decode("utf-8").strip()
        if not path:
            return None
        # recent API responses embed the full URL already
        if path.startswith("http"):
            return path
        return "https://aac.saavncdn.com/" + path.lstrip("/")
    except Exception as exc:
        log.warning("Could not decrypt media url: %s", exc)
        return None


def _bump_bitrate(url: str, bitrate: int = MAX_BITRATE) -> str:
    """Swap the embedded bitrate token (e.g. `_96.mp4` -> `_320.mp4`)."""
    m = re.search(r"(_\d+)\.(mp4|m4a|mp3)$", url)
    if m:
        return url[: m.start()] + f"_{bitrate}." + m.group(2)
    return url


def _stream_alive(url: str) -> bool:
    """Check if CDN URL is reachable and serves audio."""
    if not url or not url.startswith("http"):
        return False
    try:
        r = requests.head(url, timeout=6, allow_redirects=True,
                          headers={"User-Agent": USER_AGENT, "Referer": API_BASE})
        if r.status_code in (200, 206, 301, 302):
            return True
        return False
    except Exception:
        return True


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

def _norm_track(item: dict, resolve: bool = True) -> Dict:
    """Normalize a raw JioSaavn search result into our standard track shape."""
    info = item.get("more_info") or {}
    artists = info.get("artistMap") or item.get("artistMap") or {}
    primary = artists.get("primary_artists") or []

    title = item.get("song") or item.get("title") or ""
    if isinstance(title, str):
        title = html.unescape(title)

    artist_name = ""
    if primary:
        artist_name = ", ".join(a.get("name", "") for a in primary)
    elif item.get("primary_artists"):
        artist_name = item.get("primary_artists")
    elif item.get("singers"):
        artist_name = item.get("singers")
    elif item.get("subtitle"):
        artist_name = item.get("subtitle").split("-")[0].strip()
    artist_name = html.unescape(str(artist_name))

    album_name = item.get("album") or info.get("album") or item.get("subtitle") or ""
    if isinstance(album_name, str):
        album_name = html.unescape(album_name)

    cover_img = item.get("image") or info.get("image") or ""
    if isinstance(cover_img, str):
        cover_img = cover_img.replace("150x150", "500x500").replace("50x50", "500x500")

    track = {
        "id": str(item.get("id", "")),
        "source": "jiosaavn",
        "title": title,
        "artist": artist_name,
        "album": album_name,
        "cover": cover_img,
        "duration": int(info.get("duration") or item.get("duration") or 0),
        "language": str(info.get("language") or item.get("language") or ""),
        "year": str(item.get("year") or info.get("year") or ""),
        "explicit": bool(int(info.get("explicit_content") or item.get("explicit_content") or 0)),
        "has_lyrics": bool(info.get("has_lyrics") or item.get("has_lyrics")),
        "stream_url": None,
        "lyrics_url": None,
    }
    if resolve:
        resolved = _resolve_from_raw(item)
        if resolved:
            track["stream_url"] = resolved
    return track


def _resolve_from_raw(item: dict) -> Optional[str]:
    """Resolve a stream URL straight from a raw search result (with cache)."""
    info = item.get("more_info") or {}
    encrypted = item.get("encrypted_media_url") or info.get("encrypted_media_url")
    song_id = item.get("id")
    cache_key = f"id:{song_id}"
    cached = _get_cache(cache_key)
    if cached and cached.get("stream_url"):
        return cached["stream_url"]

    url = decrypt_media_url(encrypted) if encrypted else None
    if url:
        url_320 = _bump_bitrate(url, 320)
        if _stream_alive(url_320):
            url = url_320
        else:
            url_160 = _bump_bitrate(url, 160)
            if _stream_alive(url_160):
                url = url_160
            elif _stream_alive(url):
                pass
            else:
                url = None
    if url:
        _set_cache(cache_key, {"stream_url": url})
    return url


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def search(query: str, limit: int = 15, resolve: bool = True, page: int = 1) -> List[Dict]:
    """Search JioSaavn by text with pagination. Returns normalized, stream-resolved tracks."""
    q = query.strip()
    if not q:
        return []

    valid_tracks = []
    seen_ids = set()

    # On first page, inspect autocomplete.get for instant exact/lyric match & topquery
    if page == 1:
        try:
            ac = _api("autocomplete.get", {"query": q})
            if ac and isinstance(ac, dict):
                candidate_ids = []
                top_items = ac.get("topquery", {}).get("data", [])
                for it in top_items:
                    if it.get("type") == "song" and it.get("id"):
                        candidate_ids.append(it.get("id"))
                for it in ac.get("songs", {}).get("data", []):
                    if it.get("id") and it.get("id") not in candidate_ids:
                        candidate_ids.append(it.get("id"))

                for sid in candidate_ids[:3]:
                    dt = get_details(sid, resolve=resolve)
                    if dt and (not resolve or dt.get("stream_url")):
                        valid_tracks.append(dt)
                        seen_ids.add(str(dt.get("id")))
        except Exception as exc:
            log.warning("Autocomplete fetch in search failed: %s", exc)

    data = _api("search.getResults", {
        "api_version": "4",
        "ctx": "web6dot0",
        "q": q,
        "p": str(page),
        "n": str(max(limit, 20)),
    })
    results = data.get("results", []) if data and isinstance(data, dict) else []
    for it in results:
        it_id = str(it.get("id") or "")
        if it_id and it_id in seen_ids:
            continue
        t = _norm_track(it, resolve=resolve)
        if t.get("title") and (not resolve or t.get("stream_url")):
            valid_tracks.append(t)
            if it_id:
                seen_ids.add(it_id)
        if len(valid_tracks) >= limit:
            break

    # If results are still low and query doesn't already contain 'songs', try querying with 'songs'
    if len(valid_tracks) < 4 and page == 1 and "song" not in q.lower():
        more_data = _api("search.getResults", {
            "api_version": "4",
            "ctx": "web6dot0",
            "q": f"{q} songs",
            "p": "1",
            "n": "15",
        })
        more_results = more_data.get("results", []) if more_data and isinstance(more_data, dict) else []
        for it in more_results:
            it_id = str(it.get("id") or "")
            if it_id and it_id in seen_ids:
                continue
            t = _norm_track(it, resolve=resolve)
            if t.get("title") and (not resolve or t.get("stream_url")):
                valid_tracks.append(t)
                if it_id:
                    seen_ids.add(it_id)
            if len(valid_tracks) >= limit:
                break

    return valid_tracks


def get_suggestions(query: str) -> List[Dict]:
    """Returns instant suggestions and entities (songs, artists) for autocomplete."""
    q = query.strip()
    if not q:
        return []
    ac = _api("autocomplete.get", {"query": q})
    if not ac or not isinstance(ac, dict):
        return []
    suggestions = []
    seen = set()

    for item in ac.get("artists", {}).get("data", [])[:3]:
        name = item.get("title")
        if name and name.lower() not in seen:
            seen.add(name.lower())
            suggestions.append({"text": name, "type": "artist", "badge": "Artist"})

    for item in ac.get("songs", {}).get("data", [])[:5]:
        title = item.get("title")
        singers = item.get("more_info", {}).get("singers") or item.get("description", "")
        if title and title.lower() not in seen:
            seen.add(title.lower())
            suggestions.append({"text": title, "type": "song", "subtitle": singers, "badge": "Song"})

    return suggestions


def get_details(song_id: str, resolve: bool = True) -> Optional[Dict]:
    """
    Fetch rich details for a song id.
    NB: `song.getDetails` uses a flatter schema than search results
    (title lives in `song`, singers in `singers`/`primary_artists`),
    so we normalize explicitly here.
    """
    data = _api("song.getDetails", {"cc": "in", "pids": song_id})
    if not data or not isinstance(data, dict):
        return None
    item = data.get(song_id) or next(iter(data.values()), None)
    if not item:
        return None
    track = {
        "id": song_id,
        "source": "jiosaavn",
        "title": item.get("song") or item.get("title") or "",
        "artist": item.get("singers") or item.get("primary_artists") or "",
        "album": item.get("album") or "",
        "cover": item.get("image") or "",
        "duration": int(item.get("duration") or 0),
        "language": item.get("language") or "",
        "year": str(item.get("year") or ""),
        "explicit": bool(int(item.get("explicit_content") or 0)),
        "has_lyrics": str(item.get("has_lyrics") or "").lower() == "true",
        "stream_url": None,
        "lyrics": "",
    }
    if resolve:
        encrypted = item.get("encrypted_media_url")
        if encrypted:
            url = decrypt_media_url(encrypted)
            if url:
                url = _bump_bitrate(url)
                track["stream_url"] = url if _stream_alive(url) else None
    return track


def get_lyrics(song_id: str) -> str:
    """Full lyrics for a song id via the lyrics.getLyrics endpoint."""
    data = _api("lyrics.getLyrics", {"ctx": "web6dot0", "api_version": "4",
                                      "lyrics_id": song_id})
    if not data or not isinstance(data, dict):
        return ""
    lyrics = data.get("lyrics") or ""
    return lyrics.replace("<br>", "\n").replace("<br/>", "\n").strip()


def resolve_stream(query: str, song_id: Optional[str] = None) -> Optional[str]:
    """Resolve a live 320kbps stream URL for a query or known song id."""
    cache_key = f"q:{query.strip().lower()}"
    cached = _get_cache(cache_key)
    if cached:
        return cached.get("stream_url")

    results = search(query, limit=3, resolve=True)
    stream = None
    for t in results:
        if t.get("stream_url"):
            stream = t["stream_url"]
            break
    if stream:
        _set_cache(cache_key, {"stream_url": stream})
    return stream


def resolve_many(queries: List[str]) -> Dict[str, Optional[str]]:
    """Resolve several queries at once (used to hydrate the curated catalog)."""
    out: Dict[str, Optional[str]] = {}
    for q in queries:
        out[q] = resolve_stream(q)
    return out


def health() -> Dict:
    """Lightweight connectivity probe used by /api/health."""
    ok = _api("search.getResults", {"api_version": "4", "ctx": "web6dot0", "q": "arijit singh"})
    return {"reachable": ok is not None}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("JioSaavn service self-test\n--------------------------")
    print("health:", health())
    tracks = search("tum hi ho arijit singh", limit=2)
    for t in tracks:
        print(t["title"], "-", t["artist"], "|", (t["stream_url"] or "NO STREAM")[:80])
    if tracks:
        det = get_details(tracks[0]["id"])
        print("lyrics sample:", (det or {}).get("lyrics", "")[:120])
