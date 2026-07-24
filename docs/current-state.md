# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **21 / 100** |
| Bonus | **28 / 50** |
| **Total** | **49 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

## Specs (path to 100%)

Índice canónico: **`specs/INDEX.md`**.

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | ready (**next**) |
| `api-domains` | ready (HTTP thin already started; OpenAPI partial) |
| `checkout-payment` | ready |
| `frontend-live-wiring` | ready |
| `testing-coverage` | ready |
| `cloud-deploy` | ready |
| `readme-deliverables` | ready |
| `security-hardening` | ready |
| `ux-quality-bar` | ready |

## What exists (código)

| Area | Status |
|---|---|
| Mock UI NORA Soft + split checkout | **Done** |
| DynamoDB + ElectroDB + seed | **Done** |
| Hex use-cases ROP (Create/Pay + products/customers/deliveries) | **Done** |
| Thin HTTP controllers + OpenAPI paths | **Partial** (fake payment port) |
| Sandbox payment adapter | **Not started** (`FakePaymentGateway`) |
| Live FE / Jest >80% / deploy / README | **Not started** |

## Next

1. `payment-gateway` — adapter sandbox real detrás del puerto.
2. Cerrar `api-domains` (DTOs/validación/OpenAPI completo).
3. `frontend-live-wiring`.
