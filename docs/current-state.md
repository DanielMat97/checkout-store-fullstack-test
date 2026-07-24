# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **18 / 100** |
| Bonus | **15 / 50** |
| **Total** | **33 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

## Specs (path to 100%)

Índice canónico: **`specs/INDEX.md`**.

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `checkout-payment` | ready |
| `payment-gateway` | ready |
| `api-domains` | ready |
| `architecture-hex-rop` | ready (next) |
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
| `@app/persistence` ElectroDB + single-table + seed | **Done** |
| DynamoDB table en `serverless.ts` + docker local | **Done** |
| Repository ports wired in 4 Nest services | **Done** (no HTTP use-cases yet) |
| Payment adapter / live FE | **Not started** |
| Jest >80% / AWS deploy / README entregable | **Not started** |

## Local persistence

```bash
npm run dynamodb:up
npm run ensure-table
npm run seed
```

Access patterns: `docs/data-model.md`.

## Next

1. `architecture-hex-rop` — use-cases ROP reales (CreateTransaction / PayTransaction).
2. Luego `payment-gateway` → `api-domains`.
3. Re-scorear scorecard al cerrar cada feature.
