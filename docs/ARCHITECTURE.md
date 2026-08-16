# Sangeet — Architecture Deep-Dive

*Companion document for the capstone report. Everything a reviewer needs: data flow, the hybrid rationale, the decryption scheme, the NLP mapping, the data model, and the design decisions.*

---

## 1. The problem the hybrid solves

| | Spotify | JioSaavn |
|---|---|---|
| **Audio-feature ML** (valence, energy, danceability) | ✅ World-class | ❌ none exposed |
| **Full free playback in 3rd-party apps** | ❌ premium/SDK-locked (30s clips for free users) | ✅ DRM-free 320kbps direct CDN links |
| **Global catalog metadata** | ✅ | mostly Indian + international pop |

**The insight:** you don't need *one* provider for both jobs. Let Spotify decide *which song* (mathematical feature matching), let JioSaavn deliver *the audio* (full track, free). The frontend then plays it with a plain HTML5 `<audio>` tag — no SDKs, no iframes, no premium.

```
  "I'm heartbroken and it's raining at 2am"
        │
        ▼
┌─────────────────────────────┐
│ 1. NLP ENGINE (nlp_service) │
│    mood vector:             │
│    mood=heartbreak          │
│    valence=0.15  energy=0.2 │
│    genres=[acoustic,piano]  │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 2a. BRAIN: SPOTIFY (opt.)   │  target_audio_features → track titles+artists
│ 2b. FALLBACK: CATALOG +     │  curated room or live genre search on JioSaavn
│     live genre search       │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 3. PLAYER: JIOSAAVN         │  search "Channa Mereya Arijit Singh"
│    search.getResults        │  → encrypted_media_url
│    DES-ECB decrypt          │  → https://aac.saavncdn.com/..._320.mp4
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 4. BROWSER <audio>          │  full 320kbps track, seekable, volume,
│    (store/audio.jsx)        │  queue, next/prev, lyrics, like
└─────────────────────────────┘
```

## 2. NLP → audio-feature mapping

The chat text is scored against a weighted emotion lexicon (with emoji and intensity modifiers), then situation patterns (rain, late-night, exam, gym, breakup…) refine the pick. Each of the 10 mood categories carries a target feature vector, matching the standard Spotify acoustic model:

| Mood room | valence | energy | danceability | genre seeds |
|---|---|---|---|---|
| 💔 Broken Heart | 0.15 | 0.28 | 0.35 | acoustic, sad-hindi, piano |
| 🌧️ Rainy Night | 0.25 | 0.30 | 0.40 | lo-fi, ambient, rain |
| ☕ Deep Focus | 0.50 | 0.35 | 0.45 | lofi, chillhop, instrumental |
| ⚡ Gym Beast | 0.75 | 0.92 | 0.75 | phonk, edm, trap |
| 🌹 Love Vibes | 0.78 | 0.45 | 0.60 | r-n-b, bollywood-romance |
| 🔥 Frustration Release | 0.30 | 0.85 | 0.60 | rock, metal, punk |
| 🌤️ Chill Sunday | 0.68 | 0.35 | 0.55 | indie-pop, reggae, jazz |
| 🎉 Party Bangers | 0.88 | 0.88 | 0.90 | pop, dance, club |
| 🕰️ Nostalgic Hits | 0.55 | 0.45 | 0.55 | classic-hindi, 90s, retro |
| 🚀 Morning Fuel | 0.85 | 0.65 | 0.70 | motivational, pop, indie-rock |

The mapping table above is *exactly* what the UI's mood radar visualizes, which makes the "AI thinking" explainable to users and reviewers alike.

## 3. The JioSaavn stream pipeline (the interesting part)

JioSaavn exposes an internal JSON API used by its own web client:

```
GET https://www.jiosaavn.com/api.php
    ?__call=search.getResults
    &api_version=4&_format=json&ctx=web6dot0&q=<query>
```

Each result contains `more_info.encrypted_media_url` — a Base64 string hiding the direct CDN link. It is **DES-ECB** encrypted with the 8-byte key `38346591` (a constant embedded in JioSaavn's web bundle, long documented by the open-source community). Decryption (`backend/services/jiosaavn_service.py`):

```python
raw = DES.new(b"38346591", DES.MODE_ECB).decrypt(base64.b64decode(encrypted))
pad = raw[-1]                          # PKCS#5 padding
path = raw[:-pad].decode("utf-8")
# → https://aac.saavncdn.com/430/5c5ea5cc..._96.mp4
```

The token `_96` marks the 96kbps preview; swapping it to `_320` yields the **320 kbps master**, which we verify with a cheap `HEAD` (falling back to 160kbps if a song isn't available at 320). The CDN answers with `Access-Control-Allow-Origin: *` and byte-range support, so the browser streams it directly — the Flask backend never proxies audio bytes, keeping the server light and playback fast.

Lyrics use the same API family: `song.getDetails` for rich metadata and `lyrics.getLyrics` for the full text.

**Robustness:** every network call is wrapped; if JioSaavn is unreachable the pipeline silently falls back to the curated catalog (still playable if streams were cached, otherwise a graceful message). A thread-safe LRU cache (plus an on-disk cache in `data/store/resolved_streams.json`) makes repeat loads instant.

## 4. The catalog & the 500+ requirement

- `backend/data/catalog/*.json` — 10 hand-written rooms, ~15 real, famous tracks each (metadata verified, all findable on JioSaavn).
- `scripts/expand_catalog.py --min 500` — harvests *real* JioSaavn search results per room's keywords, dedupes, and merges. Re-runnable, idempotent.
- The UI's "explore more" button does the same live via `POST /api/explore`.

**Deliberate design choice:** stream URLs are *never* stored in the catalog files. CDN links rotate, so they are resolved at request time through the decryption pipeline and cached. The catalog therefore stores stable metadata (title/artist/album/query), and playback always uses a fresh, verified URL.

## 5. Data model

MongoDB (via `pymongo`) when `MONGO_URI` is set; otherwise a JSON store in `backend/data/store/` — same interface, so the app never depends on infrastructure.

**conversations**
```json
{
  "user_id": "usr_guest_9823",
  "session_id": "sess_20260810_01",
  "created_at": "2026-08-10T21:15:00Z",
  "user_query": "Need something chill for late night coding in the rain",
  "extracted_context": {
    "mood": "focus_lofi", "situations": ["late_night", "coding"],
    "sentiment_score": 0.42, "target_valence": 0.45,
    "target_energy": 0.38, "genres": ["lofi", "chillhop"]
  },
  "ai_response_text": "…",
  "recommended_tracks": [ { "track_id", "title", "artist", "stream_url", "album_art" } ]
}
```

**liked_songs**
```json
{ "user_id", "track_id", "title", "artist", "album", "cover", "stream_url", "mood_tag", "liked_at" }
```

## 6. Frontend architecture

- **One global audio engine** (`store/audio.jsx`): a single `Audio` element shared by every view, with queue, next/prev, seek, volume persistence, and keyboard shortcuts. The mini-player at the bottom always reflects whatever is playing — from a chat reply, a mood room, search, or your library.
- **Views** (state-routed, no router dependency): Chat, Browse (mood rooms), Search, Liked.
- **Live mood radar**: as the user types, a debounced `POST /api/mood` returns the mood vector and the radar animates — the chatbot "predicts the song type" before you even hit send.
- **Design language**: warm "listening room" palette (espresso, cream, ember amber — deliberately no neon), Fraunces display serif + Inter, subtle paper grain, soft shadows. Each mood room gets its own accent hue.

## 7. Testing strategy

- Unit tests for pure logic: NLP classification accuracy, valence/energy mapping, DES decrypt round-trip, catalog hydration dedupe (`backend/tests/`).
- Integration: `/api/health` probes JioSaavn reachability; every endpoint returns valid JSON; the chat pipeline is exercised end-to-end with real streams.
- Manual: in-browser playback across genres (Hindi, English, lofi, EDM), seek + volume, queue continuity, offline-fallback behavior.

## 8. Known limits & future work

- JioSaavn's API is unofficial; endpoints/keys can change (mitigated by caches + fallbacks).
- Lyrics aren't synchronized to playback (static panel) — a karaoke-style sync is a natural extension.
- Spotify "Brain" needs free developer credentials to light up; the fallback path is already production-grade.
- Deployment: serve `frontend/dist` from Flask (`python app.py` auto-detects it) or deploy the two tiers separately.
