# Playback and UX audit

## Stack discovery

1. **Framework:** React 18 + Vite web application; Flask backend. No Android, Capacitor, Cordova, or React Native project is present.
2. **Playback:** one lazily created `HTMLAudioElement` in `frontend/src/store/audio.jsx`; browser Media Session metadata/actions are added where supported.
3. **Sources:** curated catalog URLs and backend-resolved JioSaavn CDN URLs. Stream URL expiry is not returned as metadata; the backend resolver cache uses a one-hour TTL.
4. **Queue/state:** queue, current track, repeat, and shuffle live in the React `AudioProvider`; playlist/library data is handled by `api.js` and the backend JSON store, with local browser storage as a fallback.
5. **Search/playlists:** Search UI state is in `SearchView.jsx`; search uses the Flask endpoint with a client catalog fallback. Playlists are rendered by `PlaylistsView.jsx`.
6. **Persistence:** signed-in browser data uses local storage and guest data uses session storage; backend playlist data is also available. There is no SQLite/Room database.
7. **Build:** `npm --prefix frontend run build` creates the minified production web bundle in `frontend/dist/`.
8. **APK:** there is no APK build command, Android manifest, signing configuration, or APK artifact in this repository.

## Findings and changes

| Finding | Evidence | Change and status |
|---|---|---|
| Track selection could race. `playTrack` awaited a network search before changing the source; rapid taps could let an older result start later. | [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L694), [`frontend/src/api.js`](../frontend/src/api.js#L483) | Added request generations and `AbortController` cancellation; stale results are ignored. Directly playable tracks avoid the extra resolution search. **Fixed for track selection.** |
| Next-track URLs were not resolved ahead of time; the time-update handler repeatedly issued best-effort prefetch requests for already-known URLs. | [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L222), [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L337) | Added one-time URL pre-resolution at the halfway point or within 20 seconds, a 25-minute in-memory URL cache, and de-duplicated best-effort prefetch. **Improved; not a native gapless playlist or disk cache.** |
| Exhausted continuation logic could recycle the first fallback tracks and replay them despite repeat being off. | [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L74), [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L548) | Removed fallback recycling; playback now reports `Queue finished.` when no continuation exists. **Fixed.** |
| Search had a debounce but no cancellation/stale-response guard, no persisted recents, and failures appeared as empty results. | [`frontend/src/components/SearchView.jsx`](../frontend/src/components/SearchView.jsx#L173), [`frontend/src/api.js`](../frontend/src/api.js#L260) | Added 300 ms debounce, abort/stale guards, up to 10 user-scoped persisted/deduplicated recent queries, 30-second in-memory result cache, clear action, loading/empty/error states, and retry. Catalog matching ignores diacritics in [`frontend/src/data/searchEngine.js`](../frontend/src/data/searchEngine.js#L4121). **Implemented.** |
| Playlist collections had no consistent visible ordering; playlist track lists had no sort control or persisted added timestamp. | [`frontend/src/components/PlaylistsView.jsx`](../frontend/src/components/PlaylistsView.jsx#L75), [`frontend/src/api.js`](../frontend/src/api.js#L1234), [`backend/services/db_service.py`](../backend/services/db_service.py#L269) | Alphabetized playlist cards; added per-playlist local sort preference (custom, title, artist, added date, duration), persisted track-added timestamps, play-all, shuffle, and duration summary. **Partial:** there is no drag-to-reorder, rename, duplicate, or persisted server-side sort metadata. |
| The production web build is large. | Vite reports a 1,413.45 kB minified JavaScript chunk (324.71 kB gzip) after these changes. | Recorded as a performance risk; no code splitting was added because it is not required for the correctness fixes. |

## Remaining confirmed limitations

- The backend caches resolved JioSaavn URLs for up to one hour ([`backend/services/jiosaavn_service.py`](../backend/services/jiosaavn_service.py#L59)). The frontend now caches unresolved-track results for 25 minutes ([`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L222)), but URLs embedded in catalog tracks bypass that cache. The URL’s actual expiry is unknown, and a 403/404/410 does **not** currently trigger a guaranteed fresh backend resolution before fallback/skip.
- Existing media errors can try alternate bitrate URL suffixes, select another queued track, and show a player error. Exponential retry, a complete stalled-buffer state machine, and guaranteed URL refresh are **not implemented**.
- Playback remains owned by the web page ([`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L334)); browser Media Session controls are configured at [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L900), but are not an Android foreground service, native media session, audio-focus policy, or wake lock. Screen-off/background continuity depends on the browser and OS.
- The player is a single HTML audio element, not a native playlist engine. Pre-resolution and best-effort fetch warming reduce avoidable work but cannot guarantee a sub-300 ms or gapless handoff.
- No bounded disk media cache, Data Saver mode, crossfade setting, or queue/position restoration after killing the app is implemented.
- `tap_to_first_audio_ms` and `track_gap_ms` are collected at [`frontend/src/store/audio.jsx`](../frontend/src/store/audio.jsx#L397) when `localStorage["sangeet.debug"]` is `"true"` and displayed in the player diagnostics panel at [`frontend/src/components/MiniPlayer.jsx`](../frontend/src/components/MiniPlayer.jsx#L154). They have not been measured on a device.
- APK release/minification/ProGuard and real-device scenarios do not apply until an Android wrapper or native project exists.

## Test evidence

See [`TEST_REPORT.md`](./TEST_REPORT.md) for build output, available backend tests, browser smoke testing, and unmeasured device targets. No test in this audit claims real-device background playback or an APK result.
