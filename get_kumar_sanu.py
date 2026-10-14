import sys
import json
sys.path.insert(0, 'backend')
from services.jiosaavn_service import search

queries = [
    "Kumar Sanu hits",
    "Kumar Sanu romantic songs",
    "Kumar Sanu 90s classic",
    "Kumar Sanu Alka Yagnik",
    "Aashiqui songs Kumar Sanu",
    "Baazigar songs Kumar Sanu"
]

all_tracks = []
seen = set()

for q in queries:
    res = search(q, limit=25)
    for s in res:
        if not s.get('stream_url'):
            continue
        art = (s.get('artist') or '').lower()
        if 'sanu' not in art:
            continue
        if 'kishore' in art or 'divya' in art or 'mukesh kumar' in art:
            continue
        title = s.get('title', '').strip()
        norm_title = title.lower()
        if norm_title in seen:
            continue
        seen.add(norm_title)
        all_tracks.append({
            "id": f"kumar_sanu_{len(all_tracks)+1}",
            "title": title,
            "artist": s.get('artist'),
            "album": s.get('album') or "Evergreen Romance",
            "duration": s.get('duration') or 280,
            "cover": s.get('cover') or "https://c.saavncdn.com/artists/Kumar_Sanu_500x500.jpg",
            "stream_url": s.get('stream_url'),
            "badge": "Studio 320kbps"
        })

print(f"Total unique Kumar Sanu tracks: {len(all_tracks)}")
with open("kumar_sanu_verified.json", "w", encoding="utf-8") as f:
    json.dump(all_tracks, f, indent=2, ensure_ascii=False)
