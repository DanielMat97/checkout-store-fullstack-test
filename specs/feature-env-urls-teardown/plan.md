---
feature: feature-env-urls-teardown
derived_from: spec.md
---

# Plan — feature env URLs + teardown

1. ADR 0016 + INDEX.
2. Scripts: `amplify-sync-branch-env.cjs`, `post-env-urls-comment.cjs` (+ small specs).
3. Wire `deploy-feature.yml` (sync + comment); `destroy-feature.yml`.
4. Wire `deploy-api.yml` + `amplify-build-gate.yml` (prod FE URL comment / Amplify sync).
5. Living docs; format/lint; commit.

## Tasks

Ver `tasks.md`.
