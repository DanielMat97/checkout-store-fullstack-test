# Current state

> Last updated: 2026-07-24 (prod Amplify + API live on AWS `stonestore`)

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **84 / 100** |
| Bonus | **32 / 50** |
| **Total** | **116 / 150** |
| Aprueba (≥100 base) | **No** (84&lt;100) — URLs públicas OK; falta E2E pago live |

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
| `cloud-deploy` | **done** (FE+API URLs públicas) |
| `secrets-vault` | **done** |
| `checkout-payment` | ready (cerrar smoke E2E live pago) |
| `readme-deliverables` | **in_progress** (URLs en README) |
| `security-hardening` | ready |
| `ux-quality-bar` | ready |

## Deploy (live)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| Amplify app | `dw2i8myh0xumx` (branch `master`) |
| AWS profile used | `stonestore` |
| Stage | `prod` · table `checkout-store` |

- CI: `.github/workflows/ci.yml`
- Prod API: `.github/workflows/deploy-api.yml`
- Feature `fb-*`: `.github/workflows/deploy-feature.yml`
- Secrets: Vault optional; GH Secrets `AWS_*` from profile `stonestore`
- Guide: [`docs/deploy.md`](deploy.md) · FE build: `amplify.yml`

## Runtime note (Node 24)

Lambda handlers use `@codegenie/serverless-express@5` **async-only** (Node 24 dropped callback handlers).
