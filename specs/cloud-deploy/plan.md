---
feature: cloud-deploy
derived_from: spec.md
---

# Plan — AWS deploy (Actions + Amplify)

## Componentes

| Pieza | Servicio |
|---|---|
| HTTP API | API Gateway (SF4) vía `deploy-api.yml` / `deploy-feature.yml` |
| Compute | Lambda (Nest per domain); deploy selectivo por cambios |
| DB | DynamoDB `checkout-store-<stage>` |
| FE | **AWS Amplify** (`amplify.yml`) — configurado por el usuario |
| Quality | `ci.yml`: validate → prettier → lint → audit → test → coverage |
| Secrets | GitHub Secrets + Amplify env vars |

## Stages

| Stage | Trigger |
|---|---|
| `prod` (configurable) | push `main` + cambios API |
| `fb-*` | branch/tag `fb-xxx` o `fb-xxx/*` |

## Checklist post-deploy

- [ ] FE URL (Amplify)
- [ ] API URL (HttpApiUrl)
- [ ] Seed ejecutado
- [ ] Compra prueba
- [ ] HTTPS válido

## Tasks

Ver `tasks.md` · Runbook: `docs/deploy.md`.
