import sys
import json
sys.path.insert(0, 'backend')
from services.jiosaavn_service import search

artists_to_fetch = [
    ("kumar_sanu", "Kumar Sanu"),
    ("udit_narayan", "Udit Narayan"),
    ("alka_yagnik", "Alka Yagnik"),
    ("lata_mangeshkar", "Lata Mangeshkar"),
    ("mohammed_rafi", "Mohammed Rafi"),
    ("asha_bhosle", "Asha Bhosle"),
    ("sonu_nigam", "Sonu Nigam"),
    ("sunidhi_chauhan", "Sunidhi Chauhan"),
    ("neha_kakkar", "Neha Kakkar"),
    ("kk", "KK"),
    ("b_praak", "B Praak"),
    ("mohit_chauhan", "Mohit Chauhan"),
    ("kishore_kumar", "Kishore Kumar")
]

results = {}

for art_id, art_name in artists_to_fetch:
    print(f"Fetching for {art_name}...")
    songs = search(f"{art_name} hits", limit=35)
    valid_songs = []
    seen_titles = set()
    for s in songs:
        if not s.get('stream_url'):
            continue
        # Verify that artist actually matches art_name
        art_field = (s.get('artist') or '').lower()
        search_target = art_name.lower()
        
        # Exact name or main parts (e.g. for Kumar Sanu, must contain 'kumar sanu' or 'sanu')
        surname = search_target.split()[-1]
        if search_target not in art_field and (len(surname) > 3 and surname not in art_field):
            # Exclude false positives like Kishore Kumar for Kumar Sanu
            continue
        
        # Additional protection for Kumar Sanu
        if art_id == "kumar_sanu":
            if "kishore" in art_field or "divya" in art_field or "mukesh" in art_field:
                continue

        title_norm = s.get('title', '').strip().lower()
        if title_norm in seen_titles:
            continue
        seen_titles.add(title_norm)
        
        valid_songs.append({
            "id": f"{art_id}_{len(valid_songs)+1}",
            "title": s.get('title'),
            "artist": s.get('artist'),
            "album": s.get('album') or "Master Collection",
            "duration": s.get('duration') or 240,
            "cover": s.get('cover') or "https://c.saavncdn.com/artists/Kumar_Sanu_500x500.jpg",
            "stream_url": s.get('stream_url'),
            "badge": "Studio 320kbps"
        })
    print(f"  -> Got {len(valid_songs)} verified tracks for {art_name}")
    results[art_id] = valid_songs

with open("fetched_artists.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Done! Saved to fetched_artists.json")
