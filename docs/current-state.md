# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **23 / 100** |
| Bonus | **29 / 50** |
| **Total** | **52 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

## Specs (path to 100%)

Índice canónico: **`specs/INDEX.md`**.

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | **done** |
| `api-domains` | ready (**next** — polish DTOs/validation/E2E) |
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
| Mock UI NORA Soft | **Done** |
| DynamoDB + ElectroDB + seed | **Done** |
| Hex use-cases ROP | **Done** |
| `SandboxPaymentGateway` (tokenize → tx → poll) | **Done** (unit-tested w/ mock HTTP) |
| Fake gateway for local | **Done** (`PAYMENT_GATEWAY_MODE=fake`) |
| Live FE / coverage 80% / deploy | **Not started** |

## Next

1. `api-domains` — DTOs/class-validator, stock endpoint, OpenAPI completo, smoke local.
2. `frontend-live-wiring` — apagar mock.
3. Coverage + deploy + README.
