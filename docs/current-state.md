# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **18 / 100** |
| Bonus | **14 / 50** |
| **Total** | **32 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

## Specs (path to 100%)

Índice canónico: **`specs/INDEX.md`**.

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `checkout-payment` | ready (E2E real; UI ya existe) |
| `persistence-seed` | ready |
| `payment-gateway` | ready |
| `api-domains` | ready |
| `architecture-hex-rop` | ready |
| `frontend-live-wiring` | ready |
| `testing-coverage` | ready |
| `cloud-deploy` | ready |
| `readme-deliverables` | ready |
| `security-hardening` | ready |
| `ux-quality-bar` | ready |

**Implementación:** no iniciada en este lote — solo SDD.

## What exists (código)

| Area | Status |
|---|---|
| Mock UI NORA Soft + split checkout | **Done** |
| Serverless API Gateway + Nest health | Scaffold |
| DynamoDB / ElectroDB / seed | **Not started** |
| Payment adapter / live FE | **Not started** |
| Jest >80% / AWS deploy / README entregable | **Not started** |

## Next

1. Seguir orden en `specs/INDEX.md` empezando por `persistence-seed` + `architecture-hex-rop`.
2. No implementar fuera de `tasks.md` de la feature activa.
3. Re-scorear `docs/scorecard.md` al cerrar cada feature.
