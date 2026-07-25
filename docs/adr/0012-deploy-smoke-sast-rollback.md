# ADR 0012 — Playwright E2E, free SAST, ZAP post-deploy, SHA rollback

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

Production deploys need stronger assurance than unit/coverage gates: browser-level smoke after deploy, OWASP checks against live HTTPS, static analysis before ship, and an automatic way back when the new version is broken.

Constraints: prefer **free** tooling in GitHub Actions; no payment-provider brand in public docs; do not require self-hosted infra.

## Decision

1. **E2E:** Playwright (not Selenium) for post-deploy smoke against Amplify FE + API Gateway.
2. **SAST (free):**
   - **CodeQL** required in the quality gate (GitHub-native, free).
   - **SonarCloud** optional when `SONAR_TOKEN` is present (free for public OSS). Self-hosted SonarQube Community is **out of scope**.
3. **OWASP live:** OWASP ZAP baseline scan post-deploy; fail on High/Critical.
4. **Rollback:** Capture last successful `deploy-api` commit SHA before deploying; on post-deploy failure, redeploy that SHA with Serverless Framework. Amplify FE rollback is best-effort via Amplify job when configured.

## Consequences

- `ci.yml` becomes slower (CodeQL).
- Post-deploy jobs need `FE_BASE_URL` / API URL and AWS credentials for rollback.
- First-ever deploy cannot auto-rollback (no previous SHA).
- New npm dependency: `@playwright/test` (dev) — allowed by this ADR.
