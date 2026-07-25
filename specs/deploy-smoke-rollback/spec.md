---
feature: deploy-smoke-rollback
status: done
owner: devops
rubric: [6, B1]
---

# Spec — Post-deploy E2E + OWASP + quality gate + rollback

## Resumen

Como equipo de entrega, quiero que cada deploy a producción (y feature cuando aplique) pase un **gate de calidad pre-deploy**, y que **después** de un deploy exitoso se ejecuten **pruebas E2E** (navegador) y **chequeos OWASP** contra el ambiente live; si esas pruebas fallan, el sistema debe **volver a la versión anterior que sí funcionaba**. Opcionalmente (sin bloquear) se corre un smoke de **stress** con Artillery.

## Alcance

### Pre-deploy (bloquea el deploy)

- Pipeline de calidad existente (validate → prettier → lint → audit → test → coverage).
- Análisis estático de seguridad/calidad **gratuito** en GitHub Actions:
  - **CodeQL** (GitHub, gratis en repos públicos y privados estándar).
  - **SonarCloud** opcional cuando exista `SONAR_TOKEN` (tier gratis para OSS público; si no hay token, el job se omite sin fallar el gate).
- Dependencias: `npm audit` (ya existe) como control OWASP dependency-ish.

### Post-deploy (bloqueante para rollback)

- **Playwright** E2E contra FE HTTPS + API HTTPS desplegados (no Selenium: ver ADR 0012).
- Escenarios mínimos de negocio:
  1. Catálogo carga productos.
  2. Detalle de producto muestra stock.
  3. Flujo de checkout feliz (APPROVED) con tarjeta de prueba / fake según env.
  4. Consola `/orders` carga (ops demo).
  5. Health/API productos responde 200.
- **OWASP ZAP baseline** (gratis) contra FE y/o API live (headers, issues HIGH/CRITICAL fallan el job).
- Evidencia en GitHub Step Summary + artifacts (reportes Playwright / ZAP).

### Stress (opcional, no bloqueante) — ADR 0013

- Tras deploy exitoso, un job **Artillery** carga levemente `GET /products` (y health-ish paths) contra la API live.
- El job usa `continue-on-error: true`: **nunca** falla el workflow, **no** dispara rollback, **no** bloquea quality-ok ni el merge.
- Se omite con var `STRESS_ENABLED=false` o input `skip_stress` en `workflow_dispatch`.
- Carga acotada (pocos VUs / corta duración) para no agotar cuota Lambda/API Gateway ni costos.
- Artifact del reporte Artillery cuando exista.

### Rollback

- Antes del deploy se captura el **SHA last-known-good** (último `deploy-api` exitoso distinto del run actual).
- Si E2E o ZAP post-deploy fallan → redeploy API desde ese SHA (Serverless stage prod / feature).
- FE Amplify: best-effort; API ya revertida.
- **Stress Artillery no participa en la decisión de rollback.**

## Fuera de alcance

- SonarQube self-hosted Community Edition.
- Blue/green / canary AWS avanzado.
- Load test masivo / soak de horas (solo smoke de stress corto).
- Stress contra endpoints de pago (no martillar la pasarela).
- LocalStack / E2E locales obligatorios en CI.

## Criterios de aceptación (EARS)

- Cuando CI corre en PR/push, CodeQL debe ejecutarse y fallar el gate ante findings de severidad configurada (error).
- Cuando falta `SONAR_TOKEN`, el deploy **no** debe bloquearse por Sonar; cuando existe, SonarCloud debe correr pre-deploy y fallar ante quality gate rojo.
- Cuando el deploy Serverless de prod termina OK, el workflow debe lanzar un job post-deploy de Playwright + ZAP contra `FE_BASE_URL` / `API` del stage.
- Cuando Playwright o ZAP post-deploy fallan, el workflow debe redeployar el API desde el SHA last-known-good y marcar el run como fallido.
- Cuando no existe SHA previo (primer deploy), el rollback se omite con warning explícito (no inventar SHA).
- Cuando corre el stage Artillery de stress, un fallo de latencia/errores HTTP **no** debe marcar el workflow como fallido ni activar rollback.
- Cuando `STRESS_ENABLED=false` (o `skip_stress`), el job de stress se omite sin impacto.
- Cuando se busca en docs, debe existir spec/plan/tasks + ADR 0012/0013 + mención en README/current-state/`docs/ci-cd.md`.

## Supuestos

- URLs prod conocidas vía vars/secrets: `FE_BASE_URL` y API vía `print-api-url.cjs`.
- Amplify FE se despliega en paralelo; E2E espera readiness.
- Stress por defecto **habilitado** tras deploy (`STRESS_ENABLED` distinto de `false`).
- Provider brand **nunca** en source/docs públicos.

## Referencias

- ADR 0012 (Playwright + free SAST + ZAP + rollback)
- ADR 0013 (Artillery stress opcional non-blocking)
- `specs/cloud-deploy/`, `specs/security-hardening/`
- Workflows: `.github/workflows/ci.yml`, `deploy-api.yml`, `deploy-feature.yml`
- Scorecard base #6 (deploy) + bonus B1 (OWASP)
