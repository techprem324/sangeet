"""
build_consolidated_streams.py
=============================
Consolidates all verified tracks from:
- other_artists_verified.json
- kumar_sanu_verified.json
- fetched_artists.json
Deduplicates by track title and produces frontend/src/data/verifiedArtistStreams.js.
"""

import json
import os

streams_map = {}

def add_tracks(art_id, track_list):
    if not track_list:
        return
    if art_id not in streams_map:
        streams_map[art_id] = []
    
    seen_titles = {t['title'].strip().lower() for t in streams_map[art_id]}
    for t in track_list:
        if not t.get('stream_url'):
            continue
        tnorm = t['title'].strip().lower()
        if tnorm not in seen_titles:
            seen_titles.add(tnorm)
            # Ensure unique id
            t_copy = dict(t)
            t_copy['id'] = f"{art_id}_{len(streams_map[art_id]) + 1}"
            streams_map[art_id].append(t_copy)

# 1. kumar_sanu
if os.path.exists("kumar_sanu_verified.json"):
    with open("kumar_sanu_verified.json", "r", encoding="utf-8") as f:
        add_tracks("kumar_sanu", json.load(f))

# 2. other_artists_verified
if os.path.exists("other_artists_verified.json"):
    with open("other_artists_verified.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for k, v in data.items():
            add_tracks(k, v)

# 3. fetched_artists
if os.path.exists("fetched_artists.json"):
    with open("fetched_artists.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for k, v in data.items():
            add_tracks(k, v)

js_content = "/**\n * verifiedArtistStreams.js\n * Consolidated verified 320kbps CDNs for popular Indian & Global artists.\n */\n\nexport const VERIFIED_ARTIST_STREAMS = "
js_content += json.dumps(streams_map, indent=2, ensure_ascii=False)
js_content += ";\n"

with open("frontend/src/data/verifiedArtistStreams.js", "w", encoding="utf-8") as f:
    f.write(js_content)

total_tracks = sum(len(v) for v in streams_map.values())
print(f"Generated verifiedArtistStreams.js with {len(streams_map)} artists and {total_tracks} total verified tracks:")
for k, v in sorted(streams_map.items()):
    print(f"  - {k}: {len(v)} tracks")
