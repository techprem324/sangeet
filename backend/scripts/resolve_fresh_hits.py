import sys
sys.path.insert(0, 'backend')
from services import jiosaavn_service
import json
import html

queries = [
    ("Soni Soni", "Soni Soni Darshan Raval Ishq Vishk Rebound", "Darshan Raval, Jonita Gandhi", "Ishq Vishk Rebound"),
    ("Satranga", "Satranga Arijit Singh Animal", "Arijit Singh, Shreyas Puranik", "Animal"),
    ("Chaleya", "Chaleya Arijit Singh Shilpa Rao Jawan", "Arijit Singh, Shilpa Rao", "Jawan"),
    ("Born to Shine", "Born to Shine Diljit Dosanjh", "Diljit Dosanjh", "G.O.A.T."),
    ("Lover", "Lover Diljit Dosanjh MoonChild Era", "Diljit Dosanjh", "MoonChild Era"),
    ("Kinni Kinni", "Kinni Kinni Diljit Dosanjh", "Diljit Dosanjh", "Ghost"),
    ("Winning Speech", "Winning Speech Karan Aujla", "Karan Aujla, Mxrci", "Street Dreams"),
    ("Softly", "Softly Karan Aujla Making Memories", "Karan Aujla, Ikky", "Four You"),
    ("Cheques", "Cheques Shubh Still Rollin", "Shubh", "Still Rollin"),
    ("No Love", "No Love Shubh", "Shubh", "No Love"),
    ("Elevated", "Elevated Shubh", "Shubh", "Elevated"),
    ("Baller", "Baller Shubh Ikky", "Shubh, Ikky", "Baller"),
    ("One Love", "One Love Shubh", "Shubh", "One Love"),
    ("Daku", "Daku Chani Nattan Inderpal Moga", "Chani Nattan, Inderpal Moga", "Daku"),
    ("Mi Amor", "Mi Amor Sharn 407Sound The Paul", "Sharn, 407Sound", "Mi Amor"),
    ("Alag Aasmaan", "Alag Aasmaan Anuv Jain", "Anuv Jain", "Alag Aasmaan"),
    ("Baarishein", "Baarishein Anuv Jain", "Anuv Jain", "Baarishein"),
    ("Kasoor", "Kasoor Prateek Kuhad", "Prateek Kuhad", "Kasoor"),
    ("Kho Gaye Hum Kahan", "Kho Gaye Hum Kahan Jasleen Royal Prateek Kuhad Baar Baar Dekho", "Jasleen Royal, Prateek Kuhad", "Baar Baar Dekho"),
    ("Akhiyaan Gulaab", "Akhiyaan Gulaab Mitraz Teri Baaton Mein Aisa Uljha Jiya", "Mitraz", "Teri Baaton Mein Aisa Uljha Jiya")
]

verified_list = []

for idx, (clean_title, query, pref_artist, pref_album) in enumerate(queries):
    print(f"Searching: {clean_title}...")
    tracks = jiosaavn_service.search(query, limit=5)
    matched = None
    for t in tracks:
        url = t.get('stream_url', '')
        if url and jiosaavn_service._stream_alive(url):
            matched = t
            break
    
    if matched:
        title = html.unescape(matched.get('title') or clean_title)
        cover = matched.get('cover') or ''
        stream = matched.get('stream_url')
        duration = matched.get('duration') or 210
        artist = html.unescape(matched.get('artist') or pref_artist)
        album = html.unescape(matched.get('album') or pref_album)
        verified_list.append({
            "id": f"nr_{72 + len(verified_list)}",
            "title": title,
            "artist": artist,
            "album": album,
            "cover": cover,
            "stream_url": stream,
            "duration": int(duration),
            "badge": "Viral Chartbuster",
            "year": "2025"
        })
        print(f"  [OK] {title} ({artist}) -> {stream}")
    else:
        print(f"  [FAIL] {clean_title}")

with open('backend/scripts/data/fresh_20_chartbusters.json', 'w', encoding='utf-8') as f:
    json.dump(verified_list, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully verified {len(verified_list)} / {len(queries)} tracks!")
