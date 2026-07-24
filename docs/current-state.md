# Current state

> Last updated: 2026-07-24 (post `cloud-deploy` automation)

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **60 / 100** |
| Bonus | **30 / 50** |
| **Total** | **90 / 150** |
| Aprueba (≥100 base) | **No — REJECT** (#6 deploy URL = 0) |

## Specs (path to 100%)

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `payment-gateway` | **done** |
| `api-domains` | **done** |
| `frontend-live-wiring` | **done** |
| `testing-coverage` | **done** |
| `cloud-deploy` | **in_progress** (Actions+Amplify; falta URL pública verificada) |
| `checkout-payment` | ready (cerrar smoke E2E live) |
| `readme-deliverables` | ready (**next** para URLs/runbook completo) |
| `security-hardening` | ready |
| `ux-quality-bar` | ready |

## Deploy automation

- CI: `.github/workflows/ci.yml`
- Prod API (changed services): `.github/workflows/deploy-api.yml`
- Feature `fb-*`: `.github/workflows/deploy-feature.yml` + Amplify branch
- Guide: [`docs/deploy.md`](deploy.md) · FE build: `amplify.yml`

## Coverage

`npm run test:cov` verde. Detalle: [`docs/coverage.md`](coverage.md).

## Next

1. Configurar secrets/vars GH + Amplify App ID → primer deploy prod → pegar URLs.
2. `readme-deliverables` + smoke live.
3. `security-hardening` / `ux-quality-bar`.
