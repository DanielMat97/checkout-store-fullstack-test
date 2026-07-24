---
feature: cloud-deploy
derived_from: spec.md
---

# Plan — AWS deploy

## Componentes

| Pieza | Servicio |
|---|---|
| HTTP API | API Gateway (SF4) |
| Compute | Lambda (Nest per domain) |
| DB | DynamoDB |
| FE | S3 + CloudFront (recomendado) |
| Secrets | SSM/Secrets Manager |

## Stages

`dev` / `prod` opcional; mínimo un stage público estable.

## Checklist post-deploy

- [ ] FE URL
- [ ] API URL
- [ ] Seed ejecutado en tabla
- [ ] Compra prueba
- [ ] HTTPS válido

## Tasks

Ver `tasks.md`.
