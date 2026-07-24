---
feature: testing-coverage
status: done
owner: fullstack
rubric: [5]
---

# Spec — Cobertura Jest >80% FE y BE

## Resumen

Como evaluador, veo **>80%** de cobertura unitaria en frontend **y** backend, con cifras publicadas en README.

## Alcance

- Jest en `apps/web` y cada `services/*` (+ `packages/shared`).
- Umbral **>80%** statements (o lines — documentar la métrica elegida y usarla en todos).
- Tests de: validators FE, slice, use-cases ROP, adapters (fake), controllers delgados, shared headers/logger.
- CI local script `npm run test:cov` (workspace).
- Artefacto/coverage summary en README.

## Fuera de alcance

- E2E Playwright como sustituto de unit >80% (puede complementar, no reemplaza).

## Criterios de aceptación (EARS)

- Cuando se ejecuta `npm run test:cov` en el monorepo, FE debe reportar **>80%**.
- Cuando se ejecuta coverage en backend (aggregate o por service documentado), BE debe reportar **>80%**.
- Cuando se lee README, deben existir las cifras de coverage (fecha/commit o comando).
- Cuando un PR baja coverage bajo umbral, el task se considera fallido.

## Referencias

- Scorecard base #5 (30 pts) — binario duro sin reporte = 0
