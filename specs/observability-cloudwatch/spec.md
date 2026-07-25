---
feature: observability-cloudwatch
status: done
owner: platform
rubric: [ops]
---

# Spec — Logger enriquecido + CloudWatch dashboards / alertas / IAM viewer

## Resumen

Como ops/SRE, veo logs JSON estandarizados con contexto de **servicio, dominio, capa (application/domain/adapter/http), stage, ruta, statusClass, latencia y cold start**; dashboards CloudWatch (API + Lambda + logs) desplegados con **Serverless Framework**; alarmas por **picos de latencia, 5xx y 4xx**; y un **usuario IAM** solo-lectura para consultar esos tableros.

## Alcance

- Enriquecer `@app/shared` logger + `logHttpRequest` + `AccessLogMiddleware` (+ EMF métricas custom `Checkout/API`).
- Helpers de contexto (`domain` / `layer` / `operation`) y logs de aplicación en flujo pay.
- Recursos SF: Dashboard, Alarms (4xx/5xx/latency/Lambda errors), SNS alerts, IAM user + policy viewer.
- Docs: ADR 0014, `docs/observability.md`, living docs.
- Script CLI de verificación (`scripts/ops/describe-observability.cjs`).

## Fuera de alcance

- X-Ray / OpenTelemetry full APM.
- Access keys en CloudFormation (se crean vía CLI local, no en git).
- Grafana / Datadog.

## Criterios de aceptación (EARS)

- Cuando un request HTTP termina, el access log debe incluir `statusClass`, `route`, `stage`, `targetService`, `durationMs` (y coldStart cuando aplique).
- Cuando se despliega el stack Serverless, debe existir un dashboard CloudWatch nombrado por stage y alarmas 4xx/5xx/latency/errors.
- Cuando un operador usa el IAM viewer, solo puede leer dashboards/métricas/logs — sin deploy ni IAM write.
- Cuando se corre el script describe, lista dashboard + alarms vía AWS CLI.

## Referencias

- `.cursor/rules/standardized-logging.mdc`
- ADR 0014
- [`docs/observability.md`](../../docs/observability.md)
