# ADR 0013 — Optional Artillery stress (non-blocking)

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

After deploy we already run Playwright E2E and OWASP ZAP as **blocking** smoke. The team also wants a light **stress / load smoke** for signal on latency and error rates under mild concurrency, without risking false rollbacks or blocking merges.

## Decision

1. Use **Artillery** (open source CLI) with a short scenario against read-only API paths (`GET /products`, optionally `/products/{id}/stock`).
2. Run as a dedicated GitHub Actions job after successful deploy (`stress`), with **`continue-on-error: true`**.
3. Stress results never gate `quality-ok`, never trigger rollback, and never fail the overall workflow conclusion for deploy success (job may show as “failed” with warning annotation but dependents ignore it).
4. Disable via `vars.STRESS_ENABLED == 'false'` or `workflow_dispatch` input `skip_stress`.
5. Keep load tiny (e.g. ramp to ~5–10 req/s for ~30–60s) to avoid burning Lambda concurrency / API Gateway cost.

## Consequences

- New **devDependency** `artillery` at the monorepo root (or invoked via `npx`) — allowed by this ADR.
- Reports uploaded as artifacts for inspection.
- Not a substitute for proper capacity planning or paid load platforms.
