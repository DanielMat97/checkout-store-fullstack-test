---
feature: amplify-build-gate
status: done
owner: platform
rubric: [ops, deploy]
---

# Spec — Amplify build gate in CI

## Resumen

Como operador, cuando el pipeline **despliega o dispara el frontend en Amplify**, un stage de GitHub Actions **espera el job de Amplify** y **falla** si la compilación no termina en `SUCCEED` (no basta con que HTTP responda o que el job se haya “arrancado”).

## Alcance

- Script `scripts/ci/wait-amplify-job.cjs` (poll `get-job` / match por `commitId` = `GITHUB_SHA`).
- **Feature (`deploy-feature.yml`)**: tras `start-job`, stage bloqueante **Amplify build** antes del smoke.
- **Prod (`main`/`master`)**: workflow/gate cuando cambian paths FE (`apps/web/**`, `amplify.yml`, shared usado en build).
- Docs: ADR 0015, `docs/ci-cd.md`, `docs/deploy.md`, living docs.
- `npm run format` + `lint` + commit.

## Fuera de alcance

- Rollback automático de Amplify (sigue best-effort ADR 0012).
- Sustituir `amplify.yml` o migrar FE fuera de Amplify.

## Criterios de aceptación (EARS)

- Cuando `deploy-feature` inicia un RELEASE en Amplify, el pipeline debe fallar si el job termina en `FAILED` / `CANCELLED` (o timeout).
- Cuando un push a `main`/`master` toca el frontend (o el build Amplify), el gate debe esperar un job cuyo `commitId` coincida con el SHA del push y exigir `SUCCEED`.
- Cuando `AMPLIFY_APP_ID` no está configurado, el stage debe fallar de forma explícita en contextos donde se espera FE deploy (no silenciar con éxito).
- Cuando el build Amplify es `SUCCEED`, el stage queda verde y el smoke puede continuar.

## Referencias

- `amplify.yml`, ADR 0012 / 0015, [`docs/deploy.md`](../../docs/deploy.md), [`docs/ci-cd.md`](../../docs/ci-cd.md)
