---
feature: amplify-build-gate
derived_from: spec.md
---

# Plan — Amplify build gate

1. ADR 0015 — fail-closed wait on Amplify job status.
2. `scripts/ci/wait-amplify-job.cjs` (+ small unit spec for status/commit match).
3. `scripts/ci/detect-fe-amplify.cjs` — detect FE-related path changes.
4. Wire `deploy-feature.yml`: capture `job_id`, job **Amplify build (required)** before smoke.
5. Workflow `amplify-build-gate.yml` on `main`/`master` FE paths.
6. Living docs + INDEX; format/lint; commit.

## Tasks

Ver `tasks.md`.
