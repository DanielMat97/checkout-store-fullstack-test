---
feature: dependabot-audit-autofix
derived_from: plan.md
---

# Tasks — dependabot-audit-autofix

- [ ] **DA1** — ADR 0017 + entrada en `specs/INDEX.md`
- [ ] **DA2** — `.github/dependabot.yml` (npm + github-actions, weekly)
- [ ] **DA3** — `scripts/ci/npm-audit-autofix.cjs` (audit → fix → slug → dirty check) + unit smoke si aplica
- [ ] **DA4** — Workflow `.github/workflows/security-audit-autofix.yml` (schedule + dispatch, branch `fix/<slug>`, PR, `--auto` merge)
- [ ] **DA5** — Workflow o job para auto-merge de PRs Dependabot (security / dependencies) tras CI verde
- [ ] **DA6** — Living docs (`docs/security.md`, `docs/ci-cd.md`, CHANGELOG) + checklist de Settings del repo
- [ ] **DA7** — Verificación: dispatch local/`gh workflow run` o dry-run documentado; confirmar que sin diff no abre PR
