# ADR 0017 — Dependabot + npm audit autofix (`fix/*` → auto-merge master)

- **Status:** Proposed
- **Date:** 2026-07-25

## Context

The CI already fails closed on `npm audit` (high+). That blocks merges but does not **remediate**. GitHub Dependabot can surface and bump vulnerable packages; `npm audit fix` can often patch the lockfile without a human. For the tech test / small ops surface we want vulns fixed with minimal toil: open a clearly named PR and land it on `master` when quality is green.

## Decision

1. Enable **Dependabot** (`.github/dependabot.yml`) for `npm` and `github-actions` on a weekly schedule.
2. Add a scheduled / dispatch workflow that runs **`npm audit fix` without `--force`**, and if the tree is dirty:
   - branch `fix/<solution-slug>`
   - PR → `master`
   - **auto-merge (squash)** after required CI checks pass
3. Do **not** auto-apply `npm audit fix --force` unless an explicit workflow input opts in.
4. Dependabot’s own branch names stay as GitHub defines them; the `fix/<slug>` convention is owned by the audit-autofix workflow. Optionally auto-merge Dependabot security PRs without renaming.

## Consequences

- Requires repo settings: Dependabot alerts/security updates, Allow auto-merge, and CI checks compatible with bot merges.
- Residual risk: a green CI can still miss runtime edge cases after a lockfile bump — acceptable for high-severity dependency noise; majors still need humans.
- Spec: [`specs/dependabot-audit-autofix/`](../../specs/dependabot-audit-autofix/spec.md).
