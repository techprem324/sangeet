import sys
import json
sys.path.insert(0, 'backend')
from services.jiosaavn_service import search

targets = [
    ("udit_narayan", "Udit Narayan", ["udit narayan hits", "udit narayan romantic", "udit narayan 90s"], "udit"),
    ("alka_yagnik", "Alka Yagnik", ["alka yagnik hits", "alka yagnik romantic", "alka yagnik 90s"], "alka yagnik"),
    ("lata_mangeshkar", "Lata Mangeshkar", ["lata mangeshkar hits", "lata mangeshkar golden classics"], "lata"),
    ("mohammed_rafi", "Mohammed Rafi", ["mohammed rafi hits", "rafi golden classics"], "rafi"),
    ("asha_bhosle", "Asha Bhosle", ["asha bhosle hits", "asha bhosle classic"], "asha"),
    ("sonu_nigam", "Sonu Nigam", ["sonu nigam hits", "sonu nigam romantic"], "sonu nigam"),
    ("sunidhi_chauhan", "Sunidhi Chauhan", ["sunidhi chauhan hits", "sunidhi chauhan dance"], "sunidhi")
]

results = {}

for art_id, name, queries, req_token in targets:
    songs = []
    seen = set()
    for q in queries:
        res = search(q, limit=20)
        for s in res:
            if not s.get('stream_url'):
                continue
            art = (s.get('artist') or '').lower()
            if req_token not in art:
                continue
            t_norm = s.get('title', '').strip().lower()
            if t_norm in seen:
                continue
            seen.add(t_norm)
            songs.append({
                "id": f"{art_id}_{len(songs)+1}",
                "title": s.get('title'),
                "artist": s.get('artist'),
                "album": s.get('album') or "Master Collection",
                "duration": s.get('duration') or 260,
                "cover": s.get('cover') or "https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg",
                "stream_url": s.get('stream_url'),
                "badge": "Studio 320kbps"
            })
    print(f"{name}: {len(songs)} tracks")
    results[art_id] = songs

with open("other_artists_verified.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
