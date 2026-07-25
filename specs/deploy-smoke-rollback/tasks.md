---
feature: deploy-smoke-rollback
derived_from: plan.md
---

# Tasks — deploy-smoke-rollback

- [x] **DS1** — ADR 0012 + docs/ci-cd.md + INDEX/CHANGELOG/current-state stub
- [x] **DS2** — Playwright scaffold (`e2e/`) + npm scripts + smoke specs (catalog, product, checkout APPROVED, orders, API health)
- [x] **DS3** — Extender `ci.yml`: CodeQL + SonarCloud opcional; quality-ok espera ambos
- [x] **DS4** — Scripts: wait-http-ready, resolve-last-good-sha, rollback-api
- [x] **DS5** — `deploy-api.yml`: baseline → deploy → smoke (PW+ZAP) → rollback on fail
- [x] **DS6** — `deploy-feature.yml`: smoke post-deploy (+ rollback best-effort)
- [x] **DS7** — README + living docs finales; marcar tasks done
