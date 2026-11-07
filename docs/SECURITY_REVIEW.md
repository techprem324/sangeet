# Security Review — Sangeet Source Audit

**Audit scope:** source-level inspection of the default `main` branch, including `backend/app.py`, `backend/services/db_service.py`, provider services, `frontend/src/api.js`, frontend/backend dependency manifests, `.gitignore`, `backend/.env.example`, and `netlify.toml`. This is a static review, not a penetration test, live deployment assessment, dependency vulnerability scan, or Git-history secret scan.

**Status:** Sangeet should be treated as a development/demo application, not a secure public-account production service, until the Critical and High findings below are fixed and verified.

## Executive summary

The current implementation has useful development safeguards: Flask debug mode is disabled when started directly, outbound provider requests generally use timeouts, MongoDB connection selection has a bounded server-selection timeout, Python dependencies are version-pinned, and Git ignores the primary local `.env` file and JSON store files.

However, the current authentication design does not provide a trustworthy server-side identity boundary. Passwords are stored in plaintext, user-owned API routes trust a caller-supplied identifier, and the frontend can create local pseudo-sessions when backend authentication fails. These are release blockers for real user accounts.

## Confirmed findings

### Critical — Passwords are stored as plaintext

**Files:** `backend/services/db_service.py`, `backend/app.py`

`register_user()` stores the submitted password directly in the MongoDB user document or JSON fallback. `authenticate_user()` compares the submitted password directly against the stored value.

**Impact:** anyone who obtains a database backup, JSON store, database read access, or application-level dump can read users' passwords. Password reuse could expose accounts on other services too.

**Required remediation:**
- Hash passwords with Argon2id (preferred) or bcrypt using a maintained library and safe parameters.
- Never store or log the original password.
- Add password length and input validation without silently trimming or changing user passwords.
- Plan a migration for existing plaintext accounts: securely hash existing values in a controlled one-time migration, or require password resets if safe migration cannot be guaranteed.
- Add tests proving plaintext is never persisted and both legacy migration and new login work as intended.

### Critical — User-owned data routes trust client-supplied identity

**Files:** `backend/app.py`, `backend/services/db_service.py`, `frontend/src/api.js`

The API derives the user identity from request JSON or query-string `user_id` values. Playlist, liked-track, and history routes pass those values to the data layer. The database filters records by the supplied identifier, but the route layer does not authenticate the caller or prove that the identifier belongs to them.

**Impact:** a caller can change a `user_id` in a request and attempt to read, add, or delete another user's playlists, liked tracks, or history. Filtering by a client-provided ID is not authorization.

**Required remediation:**
- Establish a server-verified identity using a secure session or signed, validated access token.
- Derive the user ID from that verified identity; ignore client-supplied user IDs for authorization.
- Authorize every user-specific read, create, update, and delete route.
- Keep guest mode separate and explicitly limited to guest-owned data.
- Add cross-user access tests for every user-data endpoint.

### Critical — Frontend login and registration silently fall back to pseudo-accounts

**File:** `frontend/src/api.js`

The `register()` and `login()` methods create and save a locally generated user object when the backend request fails. The login fallback does not verify a password; it also contains a hardcoded special case for the username `prem`.

**Impact:** the UI can report a successful login or registration without server authentication. The resulting locally stored `user_id` is then sent to API routes that trust client-provided IDs, compounding the identity/authorization issue above.

**Required remediation:**
- Keep offline music browsing and guest playback available, but do not present an unverified local pseudo-account as an authenticated registered account.
- Separate guest/offline mode from authenticated-account mode in the client state.
- Require a successful server authentication response before marking a user as signed in.
- Remove hardcoded identity shortcuts from the login path.
- Preserve existing playback and guest functionality while adding tests for backend-unavailable login and registration.

### High — CORS allows every origin

**File:** `backend/app.py`

The application initializes CORS with `CORS(app)` and no explicit origin allowlist.

**Impact:** browser-based callers from arbitrary origins can read API responses where browser CORS rules permit. CORS is not authentication, but unrestricted access expands the set of websites able to interact with the API.

**Required remediation:** configure an explicit allowlist for the deployed frontend and local development origins. If cookie-based authentication is introduced, configure credentialed CORS narrowly and add appropriate CSRF protection. Do not use wildcard origins with credentials.

### High — Netlify secret scanning is disabled

**File:** `netlify.toml`

The configuration sets `SECRETS_SCAN_ENABLED` to false in both the build and build environment sections.

**Impact:** secrets accidentally introduced into build output or tracked files may not be detected by Netlify's build-time scanning.

**Required remediation:** re-enable secret scanning, investigate existing scan failures instead of suppressing them, and use only narrow, justified exclusions. The current `VITE_API_URL` exclusion should be reviewed: frontend Vite variables are public configuration, not secrets, and should not contain credentials.

### High — No rate limiting or abuse controls on public endpoints

**Files:** `backend/app.py`

Login, registration, chat, search, explore, and lyrics routes have no visible application-level rate limiting. The routes also do not consistently enforce input length, list-size, or request-body limits.

**Impact:** brute-force login attempts, automated account creation, expensive provider lookups, and oversized requests can consume application or third-party resources.

**Required remediation:** add per-IP and, after authentication, per-account limits; apply stricter limits to login/register/chat/provider-backed routes; cap request body size and input lengths; validate numeric ranges and JSON types; return 429 for throttled requests. Configure trusted proxy handling correctly if rate limiting uses forwarded client IP headers.

### High — Local JSON persistence is not safe as production account storage

**File:** `backend/services/db_service.py`

When MongoDB is missing or unavailable, the service falls back to JSON files. Writes overwrite files directly and the fallback does not provide database-grade access control, encryption, transactional consistency, or multi-instance coordination. MongoDB failures can also cause the app to switch to a local store.

**Impact:** on ephemeral hosts data may disappear on restart or redeploy; multiple workers/instances may not share the same data; a database outage may split writes across backends. JSON user records currently contain plaintext passwords.

**Required remediation:** retain JSON fallback for local/demo use if desired, but require a durable managed database for production accounts. Fail safely rather than silently switching production writes to ephemeral storage. Use tested backup/restore and migration procedures. Protect local data files with restrictive OS permissions.

### High — MongoDB connection strings may be written to logs

**File:** `backend/services/db_service.py`

The Mongo connection success message logs the full MongoDB URI. Connection exception messages are also logged.

**Impact:** if the URI contains username/password credentials, logs may expose database credentials to log readers or third-party log processors.

**Required remediation:** never log the connection URI or raw connection exception when it can contain credentials. Log a redacted host/database identifier and a safe error category instead. Rotate any credential that may already have been written to accessible logs.

### Medium — Detailed exception text is returned by the chat endpoint

**File:** `backend/app.py`

The `/api/chat` exception handler returns `str(exc)` in the response body.

**Impact:** internal provider, configuration, or implementation details may be disclosed to callers.

**Required remediation:** return a generic error and correlation/request ID to the client. Keep sanitized diagnostics in protected server logs.

### Medium — Session identifiers are not authentication

**File:** `backend/app.py`

The `X-Session-Id` header is accepted as-is. If absent, a session ID is generated from the current timestamp at second precision.

**Impact:** this value is client-controlled and predictable. It must not be treated as proof of user identity, authorization, or a secure session.

**Required remediation:** use cryptographically secure server-issued session identifiers only if session state is needed. Validate length/format and keep session IDs separate from user authentication. Derive authenticated identity from the verified session, not this header.

### Medium — Request validation is inconsistent

**File:** `backend/app.py`

Some routes use unguarded integer conversion for query/body values, and most endpoints have no consistent schema or bounds validation. For example, catalog limits and explore counts/offsets are converted directly from user input; chat and mood prompts have no visible maximum length.

**Impact:** malformed values can cause avoidable 500 responses; extremely large strings/lists or unusual values can increase CPU, memory, and provider costs.

**Required remediation:** validate JSON object shape, string lengths, numeric ranges, list sizes, and allowed fields at the API boundary. Return consistent 400/413 responses for invalid or oversized input.

### Medium — Public health endpoint exposes operational details

**File:** `backend/app.py`

`/api/health` returns provider health, Spotify enablement, database backend status, and catalog statistics.

**Impact:** this may reveal more operational information than an unauthenticated public health check needs to disclose.

**Required remediation:** expose a minimal public liveness response. Keep detailed readiness/diagnostic information private or restricted to trusted monitoring systems.

### Medium — No explicit security headers are configured in the Flask app

**File:** `backend/app.py`

The inspected Flask app does not show a security-header policy.

**Impact:** browser protections such as a Content Security Policy, frame restrictions, MIME-sniffing protection, and referrer policy are not explicitly established by this app. Some hosting/CDN defaults may add headers, but that was not verified in this source audit.

**Required remediation:** define and test a deployment-appropriate CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, frame protection (CSP `frame-ancestors`), and HTTPS/HSTS at the correct hosting layer. Avoid a CSP that breaks the existing audio, image, or provider integrations.

### Medium — Production server configuration is not separated from local startup

**Files:** `backend/app.py`, `backend/.env.example`, `start.bat`, `start.ps1`

The direct Python entry point uses Flask's built-in development server. Its fallback host is `0.0.0.0`, while the example environment file specifies `127.0.0.1`. The local scripts start the direct Python entry point.

**Positive control:** debug mode is explicitly disabled in the direct entry point.

**Required remediation:** preserve local startup scripts, but configure production to use a maintained WSGI server behind HTTPS. Set production bind/worker/time-out values explicitly and do not expose the development server as the public service.

### Medium — Browser storage is not a trusted security boundary

**File:** `frontend/src/api.js`

The client stores user information and user-scoped library data in localStorage/sessionStorage. These stores are readable and modifiable by JavaScript running on the same origin and by the user through browser tools.

**Impact:** an XSS flaw could read or alter local data; a user can edit a stored `user_id`. Browser storage must not be used as proof of authentication or authorization.

**Required remediation:** keep only non-sensitive UI/cache state in browser storage. Store authentication in a properly designed secure session (for example, HttpOnly, Secure, SameSite cookies with CSRF protections) or use a carefully managed token strategy. The server must independently authorize every private operation.

### Medium — Third-party media provider and rights exposure

**Files:** `backend/services/jiosaavn_service.py`, `backend/services/lyrics_service.py`, frontend catalog/lyrics data and Netlify redirects.

The app uses a community-documented JioSaavn internal API, decrypts media URLs using a fixed public algorithm/key, and retrieves lyrics from LRCLIB. The source code itself cannot establish that a provider permits the app to stream, cache, proxy, display, or redistribute its content.

**Impact:** provider API changes, terms restrictions, copyright claims, takedowns, or geographic limitations can affect service availability and legal compliance.

**Required remediation:** verify each provider's current terms and the project's rights to stream audio and display lyrics/artwork. Document attribution and caching rules. Do not describe a publicly reachable stream as licensed merely because it works.

### Low / operational — Dependency and CI security coverage is incomplete

**Files:** `backend/requirements.txt`, `frontend/package.json`, `frontend/package-lock.json`, `.github/workflows/ci.yml` on the production-readiness branch.

**Positive controls:** the Python requirements are pinned to exact versions; the frontend has a lockfile; the proposed CI workflow has read-only repository contents permissions and does not deploy.

**Gaps:** the current CI workflow builds/tests but does not run dependency vulnerability review, secret scanning, CodeQL/SAST, or dedicated security tests. The Python requirements file does not include hashes and some dependencies are optional/commented out.

**Required remediation:** enable Dependabot or equivalent dependency alerts and update PRs, add dependency review and secret scanning, add CodeQL or another SAST tool where supported, and add tests for authentication, authorization, malformed input, and rate limits. Review action versions and pin third-party actions to full commit SHAs for stronger supply-chain integrity.

## Existing safeguards observed

- Flask direct startup sets `debug=False`.
- Provider HTTP requests inspected in JioSaavn and LRCLIB services use explicit timeouts.
- MongoDB server selection has a bounded timeout.
- Python dependencies in `backend/requirements.txt` are exact-version pinned.
- `frontend/package-lock.json` exists and can support reproducible npm installs.
- `.gitignore` excludes the primary `.env` file, virtual environments, generated frontend output, logs, and JSON store files.
- Database query helpers generally scope playlist/liked/history operations by a user ID; the problem is that the API currently trusts the caller to choose that ID.
- The proposed CI workflow uses `contents: read` permissions and does not contain a deployment step.

These controls are useful but do not compensate for the missing authentication and authorization boundary.

## Priority remediation plan

### P0 — Before real public accounts or sensitive user data
- [ ] Replace plaintext password storage with Argon2id/bcrypt and a safe account migration/reset.
- [ ] Implement server-verified authentication and per-route authorization.
- [ ] Remove pseudo-login/pseudo-registration as a way to claim a registered identity; preserve guest/offline listening separately.
- [ ] Stop trusting client-provided user IDs.
- [ ] Remove credential-bearing Mongo URI logging and rotate any exposed credentials.
- [ ] Verify the production database is durable and access-controlled.

### P1 — Before broad public launch
- [ ] Restrict CORS to trusted origins.
- [ ] Re-enable Netlify secret scanning.
- [ ] Add rate limits, payload limits, and consistent validation.
- [ ] Return generic API errors and reduce public health details.
- [ ] Configure production WSGI, HTTPS, and security headers.
- [ ] Review media provider terms and copyright/licensing rights.
- [ ] Add cross-user authorization and abuse tests.

### P2 — Ongoing security maturity
- [ ] Enable Dependabot/dependency review, secret scanning, and CodeQL/SAST.
- [ ] Add secure account recovery, logout/session revocation, and privacy/data-deletion flows.
- [ ] Define log redaction/retention, backups, restore drills, incident response, and access reviews.
- [ ] Pin GitHub Actions to full commit SHAs and periodically review workflow permissions.
- [ ] Add regular security reviews and a responsible disclosure process.

## Compatibility requirements for fixes

Security fixes must preserve Sangeet's existing music browsing, playback, mood discovery, lyrics, playlist, liked-track, and guest experience. Implement them in small, tested steps. Do not rename API routes or change response contracts without a migration plan. Add tests before changing authentication and data persistence; use a staging deployment and rollback plan for account/data migrations.

## Scope limitations

This audit reviewed the source files listed above. It did not inspect live hosting settings, GitHub repository security settings, all commit history, deployed runtime behaviour, every frontend component, every transitive package advisory, or perform dynamic penetration testing. Therefore, absence of a finding here is not proof that a component is secure. Run dedicated secret/dependency scans and a deployment assessment before declaring the application production-ready.
