import json
import re
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

def check_url(url):
    try:
        req = urllib.request.Request(url, headers=headers, method='HEAD')
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            return resp.status in (200, 206)
    except Exception as e:
        # Retry with GET range request
        try:
            req = urllib.request.Request(url, headers={**headers, 'Range': 'bytes=0-100'}, method='GET')
            with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
                return resp.status in (200, 206)
        except Exception as e2:
            return False

with open('frontend/src/data/searchEngine.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract NEW_RELEASES_2025_2026
m = re.search(r'export const NEW_RELEASES_2025_2026 = (\[.*?\]);', content, re.DOTALL)
if m:
    tracks = json.loads(m.group(1))
    print(f"Total NEW_RELEASES_2025_2026 tracks to check: {len(tracks)}")
    broken = []
    for i, t in enumerate(tracks):
        url = t.get('stream_url', '')
        ok = check_url(url)
        if not ok:
            broken.append((i, t.get('id'), t.get('title'), t.get('artist'), url))
            print(f"BROKEN [{i}] {t.get('title')} - {url}")
        else:
            pass
    print(f"Total broken in NEW_RELEASES: {len(broken)}")
else:
    print("Could not find NEW_RELEASES_2025_2026")
