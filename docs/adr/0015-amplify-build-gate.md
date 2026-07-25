# ADR 0015 — Fail-closed Amplify build gate in GitHub Actions

## Status

Accepted — 2026-07-25

## Context

Amplify owns the SPA build (`amplify.yml`). Feature deploys kick a RELEASE job but previously only waited for HTTP readiness; a failed Amplify compile could leave the pipeline green until Playwright (or worse, never fail clearly). Prod FE pushes rely on Amplify auto-build with no Actions stage asserting `SUCCEED`.

## Decision

1. Poll Amplify job status via AWS CLI / SDK-free Node + CLI until terminal state.
2. **Fail the pipeline** on `FAILED`, `CANCELLED`, or timeout; succeed only on `SUCCEED`.
3. Prefer matching the job by **`commitId` ≈ `GITHUB_SHA`**; otherwise use explicit `jobId` from `start-job`.
4. Run as a dedicated Actions job/stage whenever FE is deployed (feature stack) or FE paths change on `main`/`master`.

## Consequences

- Feature smoke waits for a green Amplify build first (slower, clearer failures).
- Requires `AMPLIFY_APP_ID` + AWS credentials in the gate jobs.
- Amplify console still owns the build definition; Actions only verifies outcome.
