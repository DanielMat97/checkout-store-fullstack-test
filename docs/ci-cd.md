# CI/CD — quality, smoke, rollback

> Spec: [`specs/deploy-smoke-rollback/`](../specs/deploy-smoke-rollback/spec.md) · ADR: [`0012`](adr/0012-deploy-smoke-sast-rollback.md)

## Pipeline (prod)

1. **Quality (pre-deploy, fail-closed)**  
   `validate → prettier → lint → audit → test → coverage` + **CodeQL** + **SonarCloud** (solo si `SONAR_TOKEN`).
2. **Baseline** — guarda el SHA del último `Deploy API (prod)` exitoso (`last-good`).
3. **Deploy** — Serverless Framework stage `prod` (o `SERVERLESS_STAGE`).
4. **Smoke (post-deploy)**  
   - Espera FE/API ready  
   - **Playwright** E2E  
   - **OWASP ZAP** baseline  
5. **Rollback** — si smoke falla, `serverless deploy` del SHA last-good y el workflow termina en failure.

## Variables / secrets

| Key | Tipo | Requerido |
|---|---|---|
| `FE_BASE_URL` | variable | Sí para smoke prod (ej. Amplify master URL) |
| `SONAR_TOKEN` | secret | No (omite Sonar) |
| `SONAR_ORGANIZATION` | variable | Con Sonar |
| `SONAR_PROJECT_KEY` | variable | Con Sonar |
| AWS / payment / Amplify | existentes | Sí para deploy/rollback |

## Local E2E

```bash
# API + web en marcha (npm run dev), luego:
FE_BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:3000 npm run test:e2e
```

Usa tarjeta de prueba del flujo NORA; no commits con PAN reales.

## Feature (`fb-*`)

Tras deploy aislado + Amplify: mismo smoke contra URLs del feature; rollback best-effort al SHA baseline del run.
