# Deployment and Operations Guide

This guide describes the deployment shape currently represented in the repository and the checks needed before a public production release. It does not change the existing local development workflow.

## Current deployment shape

- The frontend is built with Vite from `frontend/`.
- `netlify.toml` configures Netlify to run `npm run build` from the frontend base and publish `dist`.
- The Netlify configuration includes an LRCLIB proxy route and a React single-page-app fallback.
- The Flask API is a separate service when deployed independently. The frontend must be configured to call the correct API origin using the existing frontend configuration mechanism.
- Locally, the root `npm start` command launches Flask and Vite together.

The Netlify configuration currently disables secret scanning. Re-enable it before production deployment and investigate any detected secrets rather than suppressing findings.

## Environment configuration

Use the existing `backend/.env.example` as a reference. Keep real values in your hosting provider's secret/environment-variable manager.

- Never commit `.env` files or production credentials.
- Use separate credentials and databases for development, staging, and production.
- Restrict access to production secrets to the smallest necessary set of maintainers.
- Rotate secrets immediately if they are exposed.
- Confirm the actual environment variable names against the code before configuring a host; examples can become stale.

Do not put server-only secrets in frontend variables. Variables exposed to Vite client bundles are public.

## Production API process

Do not run Flask's built-in development server as the public production process. Use a production WSGI server supported by the selected host, configure worker/time-out settings for the workload, and put the service behind HTTPS termination and the host's supported reverse proxy.

Keep the existing API routes stable while introducing the production process. Verify the health endpoint and all critical API routes after deployment.

## Persistence

The application can use MongoDB or a JSON file fallback. A JSON file fallback is useful for local development, but a local/ephemeral filesystem on many cloud hosts is not a durable production database.

Before onboarding real users:

1. Choose a managed persistent database.
2. Configure network access and least-privilege database credentials.
3. Back up existing data before migration.
4. Test migration and restore in staging.
5. Verify that account records and user-owned data are isolated.
6. Set backup retention and test recovery.

## Frontend and API origin

Configure the frontend's API base URL using the repository's actual Vite configuration. Do not guess a variable name: inspect the current frontend configuration and use the same existing setting.

The API must allow only trusted frontend origins. A public frontend does not make every origin a trusted caller.

## Release checklist

- [ ] CI checks pass on the exact commit to be deployed.
- [ ] Frontend production build succeeds.
- [ ] Backend tests pass; network-dependent tests are run separately and reported.
- [ ] P0 security items in [Production Readiness](PRODUCTION_READINESS.md) are resolved.
- [ ] No secrets are present in Git, frontend bundles, logs, or artifacts.
- [ ] Provider terms and music/media rights have been reviewed.
- [ ] Database backups and restore process are verified.
- [ ] Staging smoke tests cover registration/login, search, playback, lyrics, playlists, liked tracks, and guest behaviour.
- [ ] Rollback artifact and responsible maintainer are identified.
- [ ] Post-deploy health, error, and latency monitoring is available.

## Rollback

Keep the previous known-good frontend and backend release artifacts. If a release breaks critical flows, roll back to the previous artifacts, verify health and playback, and preserve logs for diagnosis. For schema or account migrations, use a separately tested rollback or forward-fix plan; redeploying old code alone may not reverse data changes.
