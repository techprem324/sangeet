import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

queries = [
    ("Soni Soni", "Darshan Raval Jonita Gandhi Soni Soni Ishq Vishk"),
    ("Satranga", "Arijit Singh Satranga Animal"),
    ("Chaleya", "Arijit Singh Shilpa Rao Chaleya Jawan"),
    ("Born to Shine", "Diljit Dosanjh Born to Shine"),
    ("Lover", "Diljit Dosanjh Lover"),
    ("Kinni Kinni", "Diljit Dosanjh Kinni Kinni"),
    ("Winning Speech", "Karan Aujla Winning Speech"),
    ("Softly", "Karan Aujla Softly"),
    ("Cheques", "Shubh Cheques"),
    ("No Love", "Shubh No Love"),
    ("Elevated", "Shubh Elevated"),
    ("Baller", "Shubh Baller"),
    ("One Love", "Shubh One Love"),
    ("Daku", "Chani Nattan Inderpal Moga Daku"),
    ("Mi Amor", "Sharn 407Sound Mi Amor"),
    ("Alag Aasmaan", "Anuv Jain Alag Aasmaan"),
    ("Baarishein", "Anuv Jain Baarishein"),
    ("Kasoor", "Prateek Kuhad Kasoor"),
    ("Kho Gaye Hum Kahan", "Jasleen Royal Prateek Kuhad Kho Gaye Hum Kahan"),
    ("Akhiyaan Gulaab", "Mitraz Akhiyaan Gulaab TBMAUJ")
]

results = []

def test_url(url):
    try:
        req = urllib.request.Request(url, headers=headers, method='HEAD')
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            return resp.status in (200, 206)
    except:
        return False

for title, q in queries:
    url = f"https://saavn.dev/api/search/songs?query={urllib.parse.quote(q)}&limit=5"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            songs = data.get('data', {}).get('results', [])
            found = False
            for s in songs:
                dl = s.get('downloadUrl', [])
                if not dl: continue
                # pick 320kbps
                best = dl[-1].get('url') if dl else None
                if not best: continue
                if test_url(best):
                    img = s.get('image', [])
                    cover = img[-1].get('url') if img else ''
                    artists = ', '.join([a.get('name') for a in s.get('artists', {}).get('primary', [])]) or s.get('artist', '')
                    results.append({
                        "id": f"nr_{len(results) + 72}",
                        "title": s.get('name', title),
                        "artist": artists or "Popular Artist",
                        "album": s.get('album', {}).get('name', '') if isinstance(s.get('album'), dict) else (s.get('album') or "Chartbuster"),
                        "cover": cover,
                        "stream_url": best,
                        "duration": int(s.get('duration') or 200),
                        "badge": "Viral 2025-2026",
                        "year": "2025"
                    })
                    print(f"VERIFIED: {s.get('name')} -> {best}")
                    found = True
                    break
            if not found:
                print(f"NOT FOUND: {title}")
    except Exception as e:
        print(f"ERR {title}: {e}")

with open('backend/scripts/more_songs.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print(f"Saved {len(results)} verified tracks to backend/scripts/more_songs.json")
