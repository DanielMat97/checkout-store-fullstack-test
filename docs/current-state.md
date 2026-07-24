# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **29 / 100** |
| Bonus | **29 / 50** |
| **Total** | **58 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

## Specs (path to 100%)

Índice canónico: **`specs/INDEX.md`**.

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | **done** |
| `api-domains` | **done** |
| `checkout-payment` | ready (BE listo; falta FE) |
| `frontend-live-wiring` | ready (**next**) |
| `testing-coverage` | ready |
| `cloud-deploy` | ready |
| `readme-deliverables` | ready |
| `security-hardening` | ready |
| `ux-quality-bar` | ready |

## What exists (código)

| Area | Status |
|---|---|
| 4 domain HTTP APIs + DTOs + ValidationPipe | **Done** |
| OpenAPI + `docs/api/smoke.md` | **Done** |
| Sandbox/fake payment + Dynamo seed | **Done** |
| FE live (off mock) | **Not started** |
| Coverage 80% / deploy / README | **Not started** |

## Next

1. `frontend-live-wiring` — `VITE_MOCK_MODE=false`, client API, Redux live.
2. Luego coverage → deploy → README.
