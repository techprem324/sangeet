# Security Review — Current Repository Snapshot

This is a source-level review of the repository snapshot inspected while preparing the production-readiness foundation. It is not a penetration test or a guarantee that every issue has been found.

**Important:** treat the current application as a development/demo project until the P0 items in [Production Readiness](PRODUCTION_READINESS.md) are addressed and independently verified.

## Findings requiring remediation

### 1. Passwords are stored and compared as plaintext — Critical

The current registration and authentication logic in `backend/services/db_service.py` writes a `password` value directly to MongoDB or the JSON fallback and compares it directly during login.

**Required fix:** use a password-hashing library such as Argon2id or bcrypt, never store recoverable passwords, and create a tested migration/reset plan for existing accounts. Do not silently change this as part of a documentation-only update.

### 2. User identity is supplied by the client — Critical

Routes in `backend/app.py` accept `user_id` from request bodies or query parameters. The data service scopes records by that value, but the route layer does not establish that the caller is authenticated as that user.

**Required fix:** derive identity from a verified server-side session or token and authorize every user-specific operation against that identity. Guest mode should remain explicitly isolated and should not be able to select another user's identifier.

### 3. CORS is unrestricted — High

The Flask app currently calls `CORS(app)` without an origin allowlist.

**Required fix:** configure an explicit list of production and local development origins through server-side configuration. Test preflight requests and ensure private endpoints do not accept untrusted origins.

### 4. Netlify secret scanning is disabled — High

The current `netlify.toml` sets `SECRETS_SCAN_ENABLED` to false.

**Required fix:** re-enable secret scanning, investigate why it was disabled, and configure only narrowly justified exclusions. Do not broadly suppress scanning to make a build pass.

### 5. Error detail may be returned to API clients — Medium

The `/api/chat` exception handler returns `str(exc)` in its JSON response.

**Required fix:** return a stable generic error and request ID to clients; keep diagnostic details in access-controlled server logs with secrets and personal data redacted.

### 6. Development server and bind defaults need deployment separation — Medium

The application starts with Flask's built-in server when executed directly. The `.env.example` and code defaults also show different host defaults.

**Required fix:** retain the current local start experience, but use a production WSGI server and explicit host/port configuration in deployment.

### 7. Music and media rights need verification — Release blocker

The project uses third-party music search/streaming, lyrics, artwork, and catalog data. Technical availability does not establish permission to stream, cache, display, or redistribute those assets.

**Required fix:** review each provider's current terms, copyright/licensing obligations, attribution rules, and geographic restrictions. Remove or disable any source that cannot be used lawfully.

## Additional review checklist

- Validate and bound request parameters, JSON types, and payload sizes.
- Add rate limiting and abuse controls to login, registration, search, and chat.
- Review password reset, account deletion, session invalidation, and brute-force protections.
- Ensure production data is not stored on ephemeral local filesystems.
- Restrict health endpoint details exposed publicly.
- Audit Git history and deployment artifacts for leaked credentials; rotate any exposed secrets.
- Pin and regularly update dependencies; review vulnerability alerts.
- Add tests for cross-user access attempts and unauthenticated access.
- Review log retention, privacy disclosures, data minimization, and backup access.

## Scope

This review records issues visible in the source files inspected. It does not modify application behaviour. Reassess the findings after each security fix and before every public production release.
