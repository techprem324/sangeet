"""
expand_catalog.py
=================
Bulk-expand the curated catalog to 500+ REAL songs per category.

The hand-written seed files guarantee quality; this script guarantees
*volume* — it harvests actual JioSaavn search results per category
keyword, dedupes against what already exists, and merges them in.

Usage:
    python scripts/expand_catalog.py --min 500 --dry-run
    python scripts/expand_catalog.py --min 500

Notes:
  * Only real metadata from JioSaavn is stored (no fabricated songs).
  * Stream URLs are NOT stored here — they are resolved at runtime
    (see catalog_service.hydrate) because CDN links rotate.
  * Re-runnable: existing entries are skipped.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services import jiosaavn_service  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "catalog")


def _load(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _save(path: str, data: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _norm_title(t: str) -> str:
    return " ".join(t.lower().split())


def _extract_seed_search_queries(cat: dict) -> list[str]:
    """
    Dynamically extract artist names and query keywords from current JSON seed tracks.
    """
    import re
    queries = []
    seen = set()
    seed_tracks = cat.get("tracks", [])

    # 1. Exact track queries and titles from seed tracks
    for t in seed_tracks:
        q = (t.get("query") or f"{t.get('title', '')} {t.get('artist', '')}").strip()
        if q and q.lower() not in seen:
            seen.add(q.lower())
            queries.append(q)

    # 2. Extracted individual artist names from seed tracks
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


def expand_category(path: str, target: int, dry_run: bool) -> int:
    cat = _load(path)
    seed_count = len(cat.get("tracks", []))
    existing = {_norm_title(t["title"]) for t in cat.get("tracks", []) if t.get("title")}
    print(f"\n[{cat['label']}] seeds={seed_count} current={len(existing)} target={target}")

    # Dynamically extract artists & query keywords from current seed tracks
    search_queries = _extract_seed_search_queries(cat)

    for q in search_queries:
        if len(existing) >= target:
            break
        try:
            results = jiosaavn_service.search(q, limit=40, resolve=False)
        except Exception as exc:
            print(f"  ! query failed: {q} ({exc})")
            continue
        added = 0
        for r in results:
            if len(existing) >= target:
                break
            title = r.get("title", "")
            if not title or _norm_title(title) in existing:
                continue
            existing.add(_norm_title(title))
            # Appended strictly after seed tracks
            cat["tracks"].append({
                "title": title,
                "artist": r.get("artist", ""),
                "album": r.get("album", ""),
                "language": r.get("language", ""),
                "year": r.get("year", ""),
                "query": f"{title} {r.get('artist', '')}".strip(),
                "auto": True,
            })
            added += 1
        print(f"  + {q}: added {added} (total {len(existing)})")
        time.sleep(0.4)  # be gentle with the unofficial API

    if not dry_run:
        _save(path, cat)
    return len(existing)


def main() -> None:
    ap = argparse.ArgumentParser(description="Expand curated catalog to N real songs per category")
    ap.add_argument("--min", type=int, default=500, help="minimum tracks per category")
    ap.add_argument("--dry-run", action="store_true", help="report only, don't write")
    args = ap.parse_args()

    paths = sorted(f for f in os.listdir(DATA_DIR) if f.endswith(".json"))
    for fn in paths:
        total = expand_category(os.path.join(DATA_DIR, fn), args.min, args.dry_run)
        print(f"  => {fn}: {total} tracks {'(dry run)' if args.dry_run else '(written)'}")


if __name__ == "__main__":
    main()
