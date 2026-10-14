import json
import os

streams_map = {}

if os.path.exists("kumar_sanu_verified.json"):
    with open("kumar_sanu_verified.json", "r", encoding="utf-8") as f:
        streams_map["kumar_sanu"] = json.load(f)

if os.path.exists("other_artists_verified.json"):
    with open("other_artists_verified.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        for k, v in data.items():
            streams_map[k] = v

js_content = "/**\n * verifiedArtistStreams.js\n * Curated, verified 320kbps CDNs for popular Indian artists.\n */\n\nexport const VERIFIED_ARTIST_STREAMS = "
js_content += json.dumps(streams_map, indent=2, ensure_ascii=False)
js_content += ";\n"

with open("frontend/src/data/verifiedArtistStreams.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated frontend/src/data/verifiedArtistStreams.js with {len(streams_map)} artists:")
for k, v in streams_map.items():
    print(f" - {k}: {len(v)} tracks")
