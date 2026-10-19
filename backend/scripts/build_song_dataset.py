#!/usr/bin/env python3
"""
Build a clean song dataset (artist + title) from authoritative sources.

Sources
  - MusicBrainz (free, no key): canonical artist names + verified recordings
  - Last.fm (free key, optional): popularity ranking, so only "standard"
    (widely listened) songs are kept

Usage
  pip install requests
  python build_song_dataset.py --artists artists.txt --out songs.csv \
      --contact you@example.com [--lastfm-key YOUR_KEY] [--top 50]

Modes
  With --lastfm-key : top N most-listened tracks per artist, each one verified
                      against MusicBrainz (column mb_verified).
  Without           : all studio-style recordings from MusicBrainz, deduplicated
                      and stripped of live/remix/karaoke/demo versions.

Output files
  songs.csv        the dataset
  needs_review.txt artists that could not be matched confidently (check by hand)

Note: MusicBrainz asks for max 1 request/second; the script respects that, so
large artist lists take time. Re-run is safe; finished artists are skipped.
"""
import argparse
import csv
import os
import re
import time

import requests

MB = "https://musicbrainz.org/ws/2"
LFM = "https://ws.audioscrobbler.com/2.0/"

BAD_WORDS = re.compile(
    r"\b(live|remix|karaoke|instrumental|demo|acoustic version|radio edit|"
    r"slowed|reverb|sped up|cover|tribute|ringtone|medley|commentary)\b", re.I)

FIELDS = ["artist", "artist_mbid", "title", "rank", "lastfm_listeners",
          "lastfm_playcount", "mb_verified", "mb_recording_id", "first_release_date"]


def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


class Http:
    def __init__(self, contact):
        self.s = requests.Session()
        self.s.headers["User-Agent"] = f"SongDatasetBuilder/1.0 ({contact})"
        self.last = 0.0

    def get(self, url, params, delay=1.1):
        for attempt in range(5):
            wait = delay - (time.time() - self.last)
            if wait > 0:
                time.sleep(wait)
            r = self.s.get(url, params=params, timeout=30)
            self.last = time.time()
            if r.status_code in (429, 503):
                time.sleep(5 * (attempt + 1))
                continue
            r.raise_for_status()
            return r.json()
        raise RuntimeError(f"Request kept failing: {url}")


def find_artist(http, name):
    data = http.get(f"{MB}/artist", {"query": f'artist:"{name}"', "fmt": "json", "limit": 5})
    best = None
    for a in data.get("artists", []):
        score = int(a.get("score", 0))
        if norm(a["name"]) == norm(name) and score >= 90:
            return a
        if best is None and score >= 98:
            best = a
    return best


def mb_all_recordings(http, mbid, max_pages=15):
    seen, rows = set(), []
    for page in range(max_pages):
        data = http.get(f"{MB}/recording", {
            "artist": mbid, "fmt": "json", "limit": 100, "offset": page * 100})
        recs = data.get("recordings", [])
        for r in recs:
            title = r.get("title", "")
            if BAD_WORDS.search(title) or BAD_WORDS.search(r.get("disambiguation", "") or ""):
                continue
            key = norm(title)
            if not key or key in seen:
                continue
            seen.add(key)
            rows.append({"title": title, "mb_recording_id": r["id"],
                         "first_release_date": r.get("first-release-date", "")})
        if len(recs) < 100:
            break
    return rows


def lastfm_top(http, key, artist, top):
    data = http.get(LFM, {"method": "artist.gettoptracks", "artist": artist,
                          "api_key": key, "format": "json", "limit": top,
                          "autocorrect": 1}, delay=0.3)
    return data.get("toptracks", {}).get("track", [])


def mb_verify(http, mbid, title):
    q = f'recording:"{title}" AND arid:{mbid}'
    data = http.get(f"{MB}/recording", {"query": q, "fmt": "json", "limit": 3})
    for r in data.get("recordings", []):
        if norm(r.get("title", "")) == norm(title):
            return r["id"], r.get("first-release-date", "")
    return "", ""


def done_artists(path):
    if not os.path.exists(path):
        return set()
    with open(path, newline="", encoding="utf-8") as f:
        return {row["artist"] for row in csv.DictReader(f)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--artists", required=True, help="text file, one artist per line")
    ap.add_argument("--out", default="songs.csv")
    ap.add_argument("--contact", required=True, help="your email (MusicBrainz requires it)")
    ap.add_argument("--lastfm-key", default=None)
    ap.add_argument("--top", type=int, default=50, help="tracks per artist in Last.fm mode")
    a = ap.parse_args()

    http = Http(a.contact)
    artists = [l.strip() for l in open(a.artists, encoding="utf-8") if l.strip() and not l.startswith("#")]
    finished = done_artists(a.out)
    new_file = not os.path.exists(a.out)

    with open(a.out, "a", newline="", encoding="utf-8") as f, \
            open("needs_review.txt", "a", encoding="utf-8") as review:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        if new_file:
            w.writeheader()
        for i, name in enumerate(artists, 1):
            print(f"[{i}/{len(artists)}] {name}")
            art = find_artist(http, name)
            if not art:
                review.write(name + "\n")
                print("   no confident match -> needs_review.txt")
                continue
            canon, mbid = art["name"], art["id"]
            if canon in finished:
                print("   already done, skipping")
                continue

            if a.lastfm_key:
                tracks = lastfm_top(http, a.lastfm_key, canon, a.top)
                for rank, t in enumerate(tracks, 1):
                    rid, date = mb_verify(http, mbid, t["name"])
                    w.writerow({"artist": canon, "artist_mbid": mbid, "title": t["name"],
                                "rank": rank, "lastfm_listeners": t.get("listeners", ""),
                                "lastfm_playcount": t.get("playcount", ""),
                                "mb_verified": bool(rid), "mb_recording_id": rid,
                                "first_release_date": date})
            else:
                for r in mb_all_recordings(http, mbid):
                    w.writerow({"artist": canon, "artist_mbid": mbid, "title": r["title"],
                                "rank": "", "lastfm_listeners": "", "lastfm_playcount": "",
                                "mb_verified": True, "mb_recording_id": r["mb_recording_id"],
                                "first_release_date": r["first_release_date"]})
            f.flush()
    print("Done. Check needs_review.txt for artists that need a manual look.")


if __name__ == "__main__":
    main()
