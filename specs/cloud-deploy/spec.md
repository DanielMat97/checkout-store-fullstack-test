---
feature: cloud-deploy
status: ready
owner: devops
rubric: [6]
---

# Spec — Deploy cloud FE + API

## Resumen

Como evaluador, abro una **URL pública** de la SPA y una **API pública** (HTTPS) conectadas, desplegadas en AWS (SF4 + hosting estático), sin secrets en el repo.

## Alcance

- Backend: Serverless Framework 4 → API Gateway + Lambdas + DynamoDB.
- Frontend: S3+CloudFront (o Amplify/otro AWS) sirviendo build Vite.
- CORS correcto hacia origen FE.
- Variables/secrets vía env / SSM / Secrets Manager.
- Documentar URLs en README.

## Fuera de alcance

- Multi-cuenta enterprise.
- Blue/green avanzado (opcional).

## Criterios de aceptación (EARS)

- Cuando un usuario anónimo abre la URL FE, debe completar una compra sandbox (o decline) contra la API desplegada.
- Cuando se llama el health/producto en API pública, debe responder 200.
- Cuando se busca en el repo, no deben existir keys de producción/sandbox hardcodeadas.
- Cuando el scorecard se re-evalúa, criterio #6 deja de ser 0 solo si hay URL verificable.

## Referencias

- ADR 0003, 0006
- Scorecard base #6
