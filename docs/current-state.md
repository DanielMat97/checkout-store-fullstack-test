# Current state

> Last updated: **2026-07-25** (scorecard re-eval con E2E cloud)

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **89 / 100** |
| Bonus | **32 / 50** |
| **Total** | **121 / 150** |
| Aprueba (≥100 base) | **No** — gap ~11 pts (sandbox live + OWASP + README) |

## Specs (path to 100%)

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | **done** (código; prod aún `fake`) |
| `api-domains` | **done** |
| `frontend-live-wiring` | **done** |
| `testing-coverage` | **done** |
| `cloud-deploy` | **done** |
| `secrets-vault` | **done** |
| `checkout-payment` | **in_progress** (E2E API cloud OK; falta sandbox + UI proof) |
| `readme-deliverables` | **in_progress** |
| `security-hardening` | ready (`X-Powered-By` aún en API prod) |
| `ux-quality-bar` | ready |

## Deploy (live)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| Amplify | `dw2i8myh0xumx` / branch `master` |
| AWS profile | `stonestore` |
| Smoke E2E | pay APPROVED + stock decrement (2026-07-25) |

## Next (para cruzar 100 base)

1. Sandbox payment keys en prod (Vault) + evidencia de 1 cargo sandbox.
2. Security headers reales en respuestas Lambda/API GW.
3. README: data-model + OpenAPI público.
