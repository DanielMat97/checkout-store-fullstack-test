---
feature: dependabot-audit-autofix
derived_from: spec.md
---

# Tasks — dependabot-audit-autofix

- [x] **DA1** — ADR 0017 + entrada en `specs/INDEX.md`
- [x] **DA2** — `.github/dependabot.yml` (npm + github-actions, weekly)
- [x] **DA3** — `scripts/ci/npm-audit-autofix.cjs` + workflow `security-audit-autofix.yml`
- [x] **DA4** — Auto-merge squash en PRs `fix/*` tras CI (via `gh pr merge --auto`)
- [x] **DA5** — Workflow `dependabot-automerge.yml` para PRs de Dependabot
- [x] **DA6** — Docs: README + `docs/ci-cd.md` + `docs/security.md` + living docs
