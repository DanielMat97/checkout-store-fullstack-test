# Current state

> Last updated: **2026-07-25** (PASS base 100 — sandbox + OWASP + OpenAPI público)

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **100 / 100** |
| Bonus | **35 / 50** |
| **Total** | **135 / 150** |
| Aprueba (≥100 base) | **Sí — PASS** |

## Specs

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | **done** (sandbox live en prod) |
| `api-domains` | **done** |
| `frontend-live-wiring` | **done** |
| `testing-coverage` | **done** |
| `cloud-deploy` | **done** |
| `secrets-vault` | **done** |
| `checkout-payment` | **done** (E2E sandbox cloud) |
| `readme-deliverables` | **done** |
| `security-hardening` | **done** (headers FE/API + `docs/security.md`) |
| `ux-quality-bar` | ready (bonus responsive matrix) |

## Deploy (live)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| OpenAPI | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |
| Payment mode | `sandbox` |
| Security | [`docs/security.md`](security.md) |
