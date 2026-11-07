# Security Policy

Sangeet welcomes responsible security research. Please help protect listeners and contributors by reporting suspected vulnerabilities privately.

## Supported versions

Security fixes are currently considered for the latest code on the `main` branch. No separate long-term-support branches are currently documented.

## Reporting a vulnerability

**Do not publish credentials, personal data, exploit details, or an unpatched vulnerability in a public issue.**

Use GitHub's private vulnerability reporting / Security Advisories feature for this repository if it is enabled. If it is unavailable, contact the repository owner privately through GitHub.

Please include:

- A concise description and potential impact.
- The affected component, route, or file.
- Reproduction steps or a proof of concept that does not access other users' data.
- Any suggested mitigation.

Please allow maintainers reasonable time to investigate and prepare a fix before public disclosure.

## Security baseline for deployments

The current codebase has security work that must be completed before it is suitable for handling real user accounts or sensitive production data. See [Production Readiness](docs/PRODUCTION_READINESS.md) and [Security Review](docs/SECURITY_REVIEW.md).

In particular:

- Do not use real credentials in source code, issues, logs, or screenshots.
- Do not expose a deployment until authentication, authorization, CORS, secrets handling, and data persistence have been reviewed and fixed.
- Do not treat a client-provided user identifier as proof of identity.
- Use HTTPS and secure, managed environment variables for deployed services.
- Keep dependencies updated and review security alerts.
