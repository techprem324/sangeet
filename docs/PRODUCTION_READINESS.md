# Sangeet Production Readiness Roadmap

This document separates the current working application from the controls needed to operate it safely and reliably for a wider public audience.

**Compatibility promise:** this roadmap does not authorize replacing existing features, changing user-facing behaviour, renaming API routes, changing the database schema, or changing the current local start commands. Implement production changes incrementally, with tests and a rollback plan.

## Current application at a glance

The repository currently contains:

- A React 18 + Vite frontend in `frontend/`.
- A Flask REST API in `backend/app.py`.
- Service modules for catalog, database persistence, mood/NLP, stream lookup, and lyrics in `backend/services/`.
- MongoDB as an optional persistence backend with a JSON-file fallback.
- Netlify frontend build and redirect configuration in `netlify.toml`.
- Existing backend tests in `backend/tests/`.
- Local development scripts and environment examples.

See [Architecture Deep-Dive](ARCHITECTURE.md), [API Reference](API.md), and [Deployment Notes](DEPLOYMENT.md).

## Release gates

Do not describe a release as production-ready until the applicable gates below have been completed and verified.

### P0 — Required before real public accounts or sensitive data

- [ ] Replace plaintext password storage with a modern password-hashing algorithm (Argon2id or bcrypt with an appropriate work factor); migrate existing accounts safely.
- [ ] Add server-verified authentication and authorization. A client-supplied `user_id` must never grant access to that user's playlists, liked songs, history, or profile.
- [ ] Protect every user-specific read and write route with authorization checks.
- [ ] Restrict CORS to explicitly configured trusted frontend origins. Do not use wildcard origins for credentialed or private APIs.
- [ ] Review session/token lifecycle, secure cookie settings if cookies are used, CSRF protections where applicable, logout, expiry, and account recovery.
- [ ] Enable deployment secret scanning and remove any bypasses that are not required.
- [ ] Audit environment variables and rotate any credential that may have entered Git history, logs, build output, or public artifacts.
- [ ] Add request validation, payload size limits, rate limiting for authentication/search/chat, and safe error responses.
- [ ] Review all external music, lyrics, artwork, and metadata sources for licensing, terms of use, attribution, and redistribution rights.
- [ ] Verify that account data is stored on durable, access-controlled storage. Do not rely on an ephemeral deployment filesystem for persistent user data.

### P1 — Reliability and operations

- [ ] Use a production WSGI server for Flask (for example, Gunicorn or Waitress) rather than Flask's development server.
- [ ] Add bounded timeouts, retry/backoff policies, and clear failure handling for external providers.
- [ ] Add structured logs with request IDs; never log passwords, tokens, or private user data.
- [ ] Add monitoring for API availability, error rates, latency, database connectivity, and provider failures.
- [ ] Define backup frequency, retention, encryption, restore testing, and data-loss objectives.
- [ ] Add database indexes and migration procedures after reviewing actual query patterns.
- [ ] Add health/readiness checks that distinguish application health from optional provider availability.
- [ ] Define deployment rollback steps and document who can access production credentials.
- [ ] Set resource limits and operational alerts appropriate to the hosting provider.

### P2 — Quality and contributor experience

- [ ] Expand unit tests for API validation, authorization, database behaviour, and fallback paths.
- [ ] Add frontend component and end-to-end tests for critical listening journeys.
- [ ] Add accessibility checks, keyboard navigation checks, and mobile browser coverage.
- [ ] Add dependency update automation and dependency vulnerability review.
- [ ] Add release notes, semantic versioning, and a documented release checklist.
- [ ] Add a privacy notice, terms of service, and a clear data deletion/contact process before onboarding public users.
- [ ] Define support expectations and incident communication procedures.

## Non-breaking implementation order

1. Establish a baseline: run the existing local startup process and record current API and UI behaviour.
2. Add tests around current behaviour before touching authentication, persistence, or playback.
3. Implement security fixes behind compatible interfaces; keep existing endpoint paths and response contracts where possible.
4. Migrate existing user data with a tested backup and rollback path.
5. Validate local development, production build, API contract, playback, playlists, liked tracks, and account flows.
6. Deploy to a staging environment first; only promote after smoke tests pass.
7. Monitor after release and keep a rollback artifact available.

## Definition of done

A production-readiness item is complete only when there is an implementation, a test or verification record, updated documentation, and a rollback or recovery approach where data or deployment state can be affected.

A green build alone does not prove security, licensing compliance, production scalability, or operational readiness.
