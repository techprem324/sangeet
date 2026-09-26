"""
catalog_service.py
==================
The curated song library + on-demand catalog expansion.

Why a curated catalog at all? The live JioSaavn search is the heart of
the app, but a hand-picked library means the app is *instantly usable*,
looks alive on first load, and every category has a guaranteed-quality
starter set — even if JioSaavn is unreachable (offline demo for the
capstone presentation).

Scalability story (the "500+ songs per category" requirement):
  * Each category JSON starts with ~12-16 hand-verified classics.
  * `scripts/expand_catalog.py` bulk-harvests REAL songs from JioSaavn
    search (per category keywords) until every category passes 500
    tracks — metadata is real, deduped, and re-runnable.
  * The `/api/catalog/explore` endpoint does the same live, on demand,
    so the UI can keep pulling fresh tracks forever.

Stream URLs are never stored in the catalog (CDN links rotate). They are
resolved live via JioSaavn at request time and cached on disk so repeat
loads are instant.
"""

from __future__ import annotations

import json
import logging
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional

from . import jiosaavn_service

log = logging.getLogger("sargam.catalog")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "catalog")
STORE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "store")
_RESOLVED_FILE = os.path.join(STORE_DIR, "resolved_streams.json")

_catalog_lock = threading.Lock()
_catalog: Optional[Dict[str, dict]] = None
_resolved: Dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Catalog loading
# ---------------------------------------------------------------------------

def _load_catalog() -> Dict[str, dict]:
    global _catalog
    if _catalog is not None:
        return _catalog
    with _catalog_lock:
        if _catalog is not None:
            return _catalog
        catalog = {}
        os.makedirs(DATA_DIR, exist_ok=True)
        for fn in sorted(os.listdir(DATA_DIR)):
            if fn.endswith(".json"):
                try:
                    with open(os.path.join(DATA_DIR, fn), encoding="utf-8") as f:
                        cat = json.load(f)
                    catalog[cat["category"]] = cat
                except Exception as exc:
                    log.warning("Skipping bad catalog file %s: %s", fn, exc)
        _catalog = catalog
        return catalog


def _load_resolved_cache() -> None:
    global _resolved
    try:
        os.makedirs(STORE_DIR, exist_ok=True)
        if os.path.exists(_RESOLVED_FILE):
            with open(_RESOLVED_FILE, encoding="utf-8") as f:
                _resolved = json.load(f)
    except Exception:
        _resolved = {}


def _save_resolved_cache() -> None:
    try:
        os.makedirs(STORE_DIR, exist_ok=True)
        with _catalog_lock:
            snapshot = dict(_resolved)
        with open(_RESOLVED_FILE, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=1)
    except Exception as exc:
        log.warning("Could not persist resolved cache: %s", exc)


_load_resolved_cache()


# ---------------------------------------------------------------------------
# Stream hydration
# ---------------------------------------------------------------------------

def hydrate(track: Dict) -> Dict:
    """
    Attach a live JioSaavn stream URL (+ cover/id) to a catalog track.
    Cached on disk so subsequent loads are instant.
    """
    query = track.get("query") or f"{track.get('title','')} {track.get('artist','')}".strip()
    key = track.get("id") or query.lower()
    cached = _resolved.get(key)
    if cached and cached.get("stream_url"):
        if jiosaavn_service._stream_alive(cached["stream_url"]):
            return {**track, "id": cached.get("id", track.get("id", "")),
                    "cover": cached.get("cover") or track.get("cover", ""),
                    "stream_url": cached["stream_url"], "source": "jiosaavn"}
        else:
            _resolved.pop(key, None)

    tracks = jiosaavn_service.search(query, limit=5, resolve=True)
    hit = next((t for t in tracks if t.get("stream_url")), None)
    if not hit and any(w in query.lower() for w in ["lo-fi", "lofi", "mix", "remix"]):
        base_q = query.lower().replace("lo-fi", "").replace("lofi", "").replace("mix", "").replace("remix", "").strip()
        base_q += f" {track.get('artist','')}".strip()
        tracks = jiosaavn_service.search(base_q, limit=5, resolve=True)
        hit = next((t for t in tracks if t.get("stream_url")), None)

    if not hit:
        return {**track, "stream_url": None, "source": "jiosaavn"}

    _resolved[key] = {"stream_url": hit["stream_url"], "id": hit["id"],
                      "cover": hit.get("cover", "")}
    _save_resolved_cache()
    return {**track, "id": hit.get("id", track.get("id", "")),
            "cover": hit.get("cover") or track.get("cover", ""),
            "stream_url": hit["stream_url"], "source": "jiosaavn",
            "duration": hit.get("duration", track.get("duration", 0))}


def hydrate_many(tracks: List[Dict]) -> List[Dict]:
    """Parallel hydration of a track list (network-bound, so thread it)."""
    with ThreadPoolExecutor(max_workers=6) as pool:
        return list(pool.map(hydrate, tracks))


def _public_track(track: Dict) -> Dict:
    """Trim internal fields before sending to the client."""
    return {k: v for k, v in track.items() if k != "query"}


# ---------------------------------------------------------------------------
# Public API & Strict Sequenced Playback
# ---------------------------------------------------------------------------

CATEGORY_ALIASES = {
    "frustration_release": "angry",
    "rainy_night": "rain_night",
    "party_bangers": "party",
    "morning_fuel": "morning_motivation",
    "broken_heart": "heartbreak",
    "gym_beast": "gym_power",
    "nostalgic_hits": "nostalgic",
    "love_vibes": "romantic",
    "deep_focus": "focus_lofi",
}


def _resolve_category(category_key: str) -> Optional[Dict]:
    catalog = _load_catalog()
    if category_key in catalog:
        return catalog[category_key]
    alias = CATEGORY_ALIASES.get(category_key)
    if alias and alias in catalog:
        return catalog[alias]
    clean = str(category_key).lower().replace("-", "_").replace(" ", "_")
    if clean in catalog:
        return catalog[clean]
    if clean in CATEGORY_ALIASES and CATEGORY_ALIASES[clean] in catalog:
        return catalog[CATEGORY_ALIASES[clean]]
    return None


def _extract_seed_search_queries(cat: Dict) -> List[str]:
    """
    Dynamically extracts artist names and query keywords from the hand-picked
    seed tracks to serve as primary search parameters for JioSaavn.
    """
    import re
    queries: List[str] = []
    seen = set()
    seed_tracks = cat.get("tracks", [])

    # 1. Exact track queries and titles from seed tracks
    for t in seed_tracks:
        q = (t.get("query") or f"{t.get('title', '')} {t.get('artist', '')}").strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            queries.append(q)

    # 2. Extracted artist names from seed tracks
    for t in seed_tracks:
        artist_raw = t.get("artist", "")
        parts = re.split(r"[,&/]| feat\.? | ft\.? ", artist_raw, flags=re.IGNORECASE)
        for part in parts:
            part = part.strip()
            if part and len(part) > 2 and part.lower() not in seen:
                seen.add(part.lower())
                queries.append(part)

    # 3. Supplemental category seed_queries as fallback
    for q in cat.get("seed_queries", []):
        if q and q.lower() not in seen:
            seen.add(q.lower())
            queries.append(q)

    return queries


def categories() -> List[Dict]:
    """Summary list of all curated categories (for the playlist rail)."""
    out = []
    for cat in _load_catalog().values():
        out.append({
            "category": cat["category"], "label": cat["label"], "emoji": cat["emoji"],
            "tagline": cat.get("tagline", ""), "description": cat.get("description", ""),
            "count": len(cat.get("tracks", [])),
            "mood_tags": cat.get("mood_tags", []),
        })
    return out


def category_tracks(category_key: str, limit: int = 50, resolve: bool = True) -> List[Dict]:
    """
    Primary Queue (The Seeds):
    When a user enters a mood room, strictly load and queue the exact hand-picked
    starter tracks directly from the respective backend/data/catalog/<mood>.json file first.
    """
    cat = _resolve_category(category_key)
    if not cat:
        return []
    tracks = cat.get("tracks", [])[:limit]
    if resolve:
        tracks = hydrate_many(tracks)
    return [_public_track(t) for t in tracks]


def search_songs(query: str, limit: int = 12) -> List[Dict]:
    """Live JioSaavn search — powers the app-wide search box."""
    return jiosaavn_service.search(query, limit=limit, resolve=True)


def explore(category_key: str, count: int = 24) -> List[Dict]:
    """
    Dynamic Queue Expansion (The Generation):
    Dynamically extracts artist names and query keywords from the current JSON seed tracks
    and uses them as the primary search parameters for the JioSaavn search.getResults pipeline.
    Results are returned for seamless appending strictly after the hand-picked seed tracks.
    """
    cat = _resolve_category(category_key)
    if not cat:
        return []

    seed_tracks = cat.get("tracks", [])
    known_titles = {t.get("title", "").strip().lower() for t in seed_tracks if t.get("title")}
    known_queries = {t.get("query", "").strip().lower() for t in seed_tracks if t.get("query")}
    seen_ids = {t.get("id") for t in seed_tracks if t.get("id")}
    candidates: List[Dict] = []

    # Dynamic extraction of artists and query keywords from current seed tracks
    search_queries = _extract_seed_search_queries(cat)

    for q in search_queries:
        try:
            results = jiosaavn_service.search(q, limit=20, resolve=False)
        except Exception as exc:
            log.warning("explore query failed: %s (%s)", q, exc)
            continue

        for t in results:
            tid = t.get("id")
            title_lower = t.get("title", "").strip().lower()
            if tid and tid in seen_ids:
                continue
            if title_lower in known_titles or title_lower in known_queries:
                continue
            seen_ids.add(tid)
            known_titles.add(title_lower)
            candidates.append(t)
            if len(candidates) >= count * 2:
                break

        if len(candidates) >= count * 2:
            break

    fresh = hydrate_many(candidates[:count])
    return [_public_track(t) for t in fresh if t.get("stream_url")]


def stats() -> Dict:
    catalog = _load_catalog()
    return {
        "categories": len(catalog),
        "curated_tracks": sum(len(c["tracks"]) for c in catalog.values()),
    }
