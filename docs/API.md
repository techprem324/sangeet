# Sangeet API Reference

Base URL: `http://127.0.0.1:5000` (dev). All endpoints are JSON. The Vite dev server proxies `/api/*` to this base automatically.

---

## `GET /api/health`
Pipeline health probe.
```json
{
  "status": "ok",
  "jiosaavn": { "reachable": true },
  "spotify": { "enabled": false },
  "database": { "backend": "json_store" },
  "catalog": { "categories": 10, "curated_tracks": 147 }
}
```

## `POST /api/chat`  ⭐ main endpoint
Body: `{ "prompt": "…", "user_id": "…", "mood_hint": "gym_power" }`
(`mood_hint` optional — used by the quick mood pills.)

Returns the full chat payload:
```json
{
  "reply": "💔 Broken Heart — got it. …",
  "mood": { "mood": "heartbreak", "mood_label": "Broken Heart", "emoji": "💔",
            "target_valence": 0.15, "target_energy": 0.2, "target_danceability": 0.35,
            "genres": ["acoustic", "sad-hindi", "piano"], "sentiment_score": -1.0,
            "confidence": 0.75, "situations": ["breakup"], "emotions": {…},
            "explanation": "…" },
  "tracks": [
    { "id": "aRZbUYD7", "source": "jiosaavn", "title": "Tum Hi Ho",
      "artist": "Arijit Singh", "album": "Aashiqui 2",
      "cover": "https://c.saavncdn.com/…", "duration": 262,
      "stream_url": "https://aac.saavncdn.com/…_320.mp4",
      "spotify_embed_url": "https://open.spotify.com/embed/track/…" }
  ],
  "why_this_song": ["Slow tempo + low valence — matches how a heavy heart moves."],
  "lyrics": "Hum Tere Bin Ab Reh Nahi Sakte\n…",
  "source": "catalog" | "spotify-brained"
}
```

## `POST /api/mood`
Pure NLP analysis (powers the live mood radar while typing). Same body shape as `/api/chat`, returns only the `mood` object.

## `GET /api/categories`
List of the 10 mood rooms: `{ "categories": [ { "category", "label", "emoji", "tagline", "description", "count" } ] }`

## `GET /api/catalog?category=focus_lofi&limit=30&resolve=1`
Curated tracks for a room, stream-hydrated. `resolve=0` skips live stream lookup.

## `POST /api/explore`
Body: `{ "category": "gym_power", "count": 24 }` → fresh live JioSaavn tracks not already in the catalog.

## `GET /api/search?q=arijit singh`
Live JioSaavn search — playable tracks.

## `GET /api/lyrics?title=Kesariya&artist=Arijit Singh&id=…`
Line-synchronized (karaoke) lyrics. Prefers lrclib.net timed lines; falls back to JioSaavn plain text.
```json
{ "synced": true, "title": "Kesariya", "text": "…",
  "lines": [ { "t": 9.44, "text": "मुझको इतना बताए कोई" }, … ] }
```
The frontend highlights `lines[i]` where `t <= playbackTime`.

## Playlists (user-created)
| Route | Method | Body / query |
|---|---|---|
| `/api/playlists` | GET | `user_id` → `{ playlists: [{_id, name, emoji, count}] }` |
| `/api/playlists` | POST | `{ user_id, name, emoji }` → created playlist |
| `/api/playlists/<id>` | GET | `user_id` → full playlist incl. ordered `tracks` |
| `/api/playlists/<id>/tracks` | POST | `{ user_id, track }` → adds (deduped) to the end |
| `/api/playlists/<id>/tracks/<key>` | DELETE | `user_id` → removes one track |
| `/api/playlists/<id>` | DELETE | `user_id` → deletes the playlist |

## `GET /api/history?user_id=usr_x`
Recent conversations for a user.

## `GET /api/liked?user_id=usr_x`
Liked songs. `POST /api/liked` with `{ "track": {…}, "mood_tag": "…" }` likes; `DELETE /api/liked/<track_id>?user_id=usr_x` unlikes.
