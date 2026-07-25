# ADR 0016 — Feature env URL comments, Amplify VITE sync, destroy workflow

## Status

Accepted — 2026-07-25

## Context

Feature stacks create an isolated API URL and Amplify branch, but operators had to dig in the Actions summary for links. Amplify `update-branch --environment-variables` **replaces** the whole map, so naive updates can drop vars. Tear-down was only documented as manual CLI. Prod FE URL after master builds was not posted on the commit.

## Decision

1. Post a **sticky PR comment** (marker `<!-- checkout-env-urls -->`) or **commit comment** with FE/API URLs after successful feature deploy and after prod FE gate/API deploy.
2. Centralize Amplify env updates in `amplify-sync-branch-env.cjs` (merge existing + set `VITE_MOCK_MODE` / `VITE_API_BASE_URL` / fees; optional RELEASE job).
3. Provide **`destroy-feature.yml`** `workflow_dispatch` (type `destroy` to confirm) removing Serverless stage + Amplify branch. Link that workflow from the sticky comment as the teardown “button”.

## Consequences

- Needs `pull-requests: write` + `contents: write` on comment jobs.
- Destroy is fail-closed on wrong confirm string; never targets `prod`/`master` Amplify delete without explicit feature ref.
