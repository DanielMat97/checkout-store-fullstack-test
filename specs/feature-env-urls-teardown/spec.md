---
feature: feature-env-urls-teardown
status: done
owner: platform
rubric: [ops, deploy]
---

# Spec — URLs en comentarios + Amplify env sync + destroy feature

## Resumen

Como desarrollador, al desplegar **`fb-*`** o **`master`/`main`**, veo en un **comentario de PR o del commit** las URLs del frontend (y API cuando aplica). El branch Amplify del feature apunta siempre a la **API del stage recién creado** vía env `VITE_*`. Desde Actions tengo un **botón** (`workflow_dispatch`) para **destruir** stack Serverless + branch Amplify del feature.

## Alcance

- Sticky comment (PR si existe; si no, commit comment) tras deploy feature y tras gate/deploy prod FE.
- Script `amplify-sync-branch-env` que **mergea** env Amplify y fija `VITE_API_BASE_URL` al HttpApi del stage (luego RELEASE).
- Tras `deploy-api` prod: sync Amplify prod branch → API prod + comentario con FE URL.
- Workflow `destroy-feature.yml` (confirmación `destroy`) que hace `serverless remove` + `amplify delete-branch`.
- Docs: ADR 0016, `docs/deploy.md`, `docs/ci-cd.md`, living docs.

## Fuera de alcance

- Destruir producción con el mismo botón.
- UI custom fuera de GitHub Actions.

## Criterios de aceptación (EARS)

- Cuando termina un deploy `fb-*` exitoso, debe existir un comentario con FE URL, API URL, stage y link al workflow Destroy.
- Cuando se crea/actualiza el branch Amplify del feature, `VITE_API_BASE_URL` debe ser la URL del stack Serverless de ese stage.
- Cuando corre Destroy con confirmación válida, deben eliminarse la tabla/stack SF y el branch Amplify del feature.
- Cuando deploy/gate de master publica FE, el commit debe comentar la URL de Amplify prod.

## Referencias

- `.github/workflows/deploy-feature.yml`, `deploy-api.yml`, `amplify-build-gate.yml`, `destroy-feature.yml`
- ADR 0015 / 0016
