# CI/CD — quality, smoke, rollback, optional stress

> Spec: [`specs/deploy-smoke-rollback/`](../specs/deploy-smoke-rollback/spec.md) · ADR: [`0012`](adr/0012-deploy-smoke-sast-rollback.md), [`0013`](adr/0013-artillery-stress-optional.md)

## Pipeline (prod)

1. **Quality (pre-deploy, fail-closed)**  
   `validate → prettier → lint → audit → test → coverage` + **CodeQL** + **SonarCloud** (solo si `SONAR_TOKEN`).
2. **Baseline** — guarda el SHA del último `Deploy API (prod)` exitoso (`last-good`).
3. **Deploy** — Serverless Framework stage `prod` (o `SERVERLESS_STAGE`).
4. **Smoke (post-deploy, bloqueante)**  
   - Espera FE/API ready  
   - **Playwright** E2E  
   - **OWASP ZAP** baseline  
5. **Stress (opcional, no bloqueante)** — **Artillery** load smoke sobre `GET /products` (`continue-on-error: true`; **no** rollback).
6. **Rollback** — solo si smoke (Playwright/ZAP) falla → `serverless deploy` del SHA last-good.

## Variables / secrets

| Key | Tipo | Requerido |
|---|---|---|
| `FE_BASE_URL` | variable | Sí para smoke prod (ej. Amplify master URL) |
| `SONAR_TOKEN` | secret | No (omite Sonar) |
| `SONAR_ORGANIZATION` | variable | Con Sonar |
| `SONAR_PROJECT_KEY` | variable | Con Sonar |
| `STRESS_ENABLED` | variable | No — pon `false` para omitir Artillery |
| AWS / payment / Amplify | existentes | Sí para deploy/rollback |

## Local

```bash
# E2E (API + web en marcha):
FE_BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:3000 npm run test:e2e

# Stress Artillery (solo API):
API_BASE_URL=http://localhost:3000 npm run test:stress
```

Usa tarjeta de prueba del flujo NORA; no commits con PAN reales. Stress no llama endpoints de pago.

## Feature (`fb-*`)

Tras deploy aislado + Amplify: smoke + Artillery opcional; rollback best-effort solo desde smoke.
