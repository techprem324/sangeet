# Test report

## Environment and build

- **Stack:** React/Vite web app + Flask API; no Android wrapper or APK build target.
- **Production build:** `npm --prefix frontend run build` — **PASS**. Vite 5.4.21 emitted the minified production bundle to the ignored `frontend/dist/` directory.
- **Build warning:** one JavaScript chunk is 1,413.45 kB minified / 324.71 kB gzip, above Vite’s 500 kB advisory threshold.
- **Backend tests:** `venv\Scripts\python.exe backend\tests\test_pipeline.py` — **PASS, 13 tests**. This uses the repository’s existing virtual environment and includes a live JioSaavn search test.
- `python -m pytest backend\tests -q` could not run because the default system Python has no `pytest`; the project virtual environment’s documented direct test runner succeeded.
- **Browser smoke test:** opened the production Vite preview, navigated to Search, entered `Arijit Singh`, observed non-empty Songs results, cleared the query, and verified the recent query appeared. The backend was not running, so the API proxy returned 500 and the test exercised the local catalog fallback only.
- **Live deployment:** the provided Netlify URL could not be loaded in the browser environment (`ERR_FAILED`); no deployment was changed or claimed verified.
- **Debug metrics:** to enable `tap_to_first_audio_ms` and `track_gap_ms`, set `localStorage.setItem('sangeet.debug', 'true')` in the browser console and reload. These metrics have not been collected during this test run.

## Device acceptance scenarios

| Scenario / target | Result | Evidence or blocker |
|---|---|---|
| Ten-song queue with screen off; zero unexpected stops | **Not run** | Requires a phone or emulator; this repository has no native Android player/service. |
| Tap-to-first-audio under 1.5 s warm / 3 s cold | **Not measured** | Browser diagnostics were added, but no controlled warm/cold device run was performed. |
| Track gap under 300 ms | **Not measured** | Browser single-element playback cannot guarantee this; measure on target devices. |
| Rapidly skip 20 times without overlap/crash | **Not run** | Requires repeatable audio playback/browser automation against accessible streams; not inferred from a successful build. |
| Airplane mode interruption and recovery | **Not run** | Requires device/network control. |
| Call or app switch; pause/resume behavior | **Not run** | Requires a real audio-focus environment; Media Session support alone is not proof. |
| Kill from recents and restore queue/position | **Not run** | There is no native app lifecycle/service or persisted player queue in this project. |
| Throttled network; search visible within 1 s | **Not measured** | The local catalog fallback rendered results, but this was not a controlled normal-network timing measurement. |
| Real Home, Player, Search, Playlists, Library screenshots and demo GIF | **Not captured** | The README has explicit capture TODOs; no real screenshots or recordings were committed. |

## Manual device checklist

Before claiming Android/APK acceptance, add or select an Android wrapper/native player, produce a signed release APK with a private local keystore, then run each scenario above on the intended device/emulator. Record measured timings, OS/browser versions, network conditions, and logs here. Do not commit the keystore, passwords, or generated APK.
