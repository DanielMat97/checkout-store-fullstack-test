# CI/CD — quality, smoke, rollback, optional stress

> Spec: [`specs/deploy-smoke-rollback/`](../specs/deploy-smoke-rollback/spec.md) · ADR: [`0012`](adr/0012-deploy-smoke-sast-rollback.md), [`0013`](adr/0013-artillery-stress-optional.md)

## Pipeline (prod)

1. **Quality (pre-deploy, fail-closed)**  
   `validate → prettier → lint → audit → test → coverage` + **CodeQL** + **SonarCloud** (si hay `SONAR_TOKEN`; el scan es **non-blocking** y no tumba `quality-ok`).
2. **Baseline** — guarda el SHA del último `Deploy API (prod)` exitoso (`last-good`).
3. **Deploy** — Serverless Framework stage `prod` (o `SERVERLESS_STAGE`).
4. **Amplify build gate (FE)** — si cambian paths FE (`apps/web/**`, `amplify.yml`, shared…), workflow `amplify-build-gate.yml` espera job Amplify `SUCCEED` para el `GITHUB_SHA` (falla en `FAILED`/`CANCELLED`/timeout). ADR 0015.
5. **Smoke (post-deploy API, bloqueante)**  
   - Espera FE/API ready  
   - **Playwright** E2E  
   - **OWASP ZAP** baseline  
6. **Stress (opcional, no bloqueante)** — **Artillery** load smoke sobre `GET /products` (`continue-on-error: true`; **no** rollback).
7. **Rollback** — solo si smoke (Playwright/ZAP) falla → `serverless deploy` del SHA last-good.

## Variables / secrets

| Key | Tipo | Requerido |
|---|---|---|
| `FE_BASE_URL` | variable | Sí para smoke prod (ej. Amplify master URL) |
| `AMPLIFY_APP_ID` | variable | Sí para gate Amplify FE |
| `AMPLIFY_PROD_BRANCH` | variable | No (default `master`) |
| `SONAR_TOKEN` | secret | No (omite Sonar) |
| `SONAR_ORGANIZATION` | variable | Con Sonar (ej. `danielmat97`) |
| `SONAR_PROJECT_KEY` | variable | Con Sonar — debe coincidir con el project key en SonarCloud (tras rename del repo: `DanielMat97_checkout-store-fullstack-test`) |
| `STRESS_ENABLED` | variable | No — pon `false` para omitir Artillery |
| AWS / payment / Amplify | existentes | Sí para deploy/rollback |

## Local

```bash
# E2E (API + web en marcha):
FE_BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:3000 npm run test:e2e

# Stress Artillery (solo API):
API_BASE_URL=http://localhost:3000 npm run test:stress

# When apps/web/ changed — Nest test + coverage + audit:
npm run ci:backend-on-fe
```

## Backend gate on FE changes

Si el diff incluye `apps/web/` (o el workflow/script del gate), CI job **Backend gate (on FE changes)** y `npm run ci:backend-on-fe` ejecutan:

1. `npm run build:shared`
2. `npm test` + `npm run test:cov` en `@app/products|customers|deliveries|transactions`
3. `npm run audit`

Sin cambios FE → skip exitoso. Spec: [`specs/frontend-hooks-coverage/`](../specs/frontend-hooks-coverage/spec.md).

Usa tarjeta de prueba del flujo NORA; no commits con PAN reales. Stress no llama endpoints de pago.

## Feature (`fb-*`)

Tras deploy aislado: Amplify env apunta al API del stage; comentario sticky en PR/commit con URLs; job Amplify SUCCEED; smoke. Teardown: workflow **Destroy feature stack** (`confirm=destroy`). ADR 0016.

```bash
npm run test:amplify-wait
npm run test:feature-env
AMPLIFY_APP_ID=dxxx AMPLIFY_BRANCH=master GITHUB_SHA=<sha> npm run ci:amplify-wait
```

Spec: [`specs/amplify-build-gate/`](../specs/amplify-build-gate/spec.md), [`specs/feature-env-urls-teardown/`](../specs/feature-env-urls-teardown/spec.md).

## Dependabot + npm audit autofix (ADR 0017)

| Pieza | Trigger | Comportamiento |
|---|---|---|
| [`.github/dependabot.yml`](../.github/dependabot.yml) | Weekly | PRs npm + github-actions |
| [`security-audit-autofix.yml`](../.github/workflows/security-audit-autofix.yml) | Cron Mon 09:00 UTC + `workflow_dispatch` | `npm audit fix` → `fix/<slug>` → auto-merge squash si CI verde |
| [`dependabot-automerge.yml`](../.github/workflows/dependabot-automerge.yml) | PR de `dependabot[bot]` | `gh pr merge --auto --squash` |

Script: [`scripts/ci/npm-audit-autofix.cjs`](../scripts/ci/npm-audit-autofix.cjs). Sin diff de lockfile → no PR. `--force` solo con input `allow_force=true`.

Repo settings (manual): Dependabot alerts + security updates, **Allow auto-merge**. Spec: [`specs/dependabot-audit-autofix/`](../specs/dependabot-audit-autofix/spec.md).

