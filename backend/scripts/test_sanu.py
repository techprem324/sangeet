import sys
sys.path.insert(0, 'backend')
from services.jiosaavn_service import search

res = search('Kumar Sanu', limit=20)
print(f"Found {len(res)} songs for Kumar Sanu:")
for s in res:
    print(f"- {s.get('title')} | {s.get('artist')} | {s.get('stream_url')[:50] if s.get('stream_url') else 'NO STREAM'}")
