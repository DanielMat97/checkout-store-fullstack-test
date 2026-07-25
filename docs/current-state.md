# Current state

> Last updated: **2026-07-25** (observability: enriched logs + CW dashboards/alarms/IAM viewer; score **150/150**)

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`**.

| | Estricto |
|---|---|
| Base | **100 / 100** |
| Bonus | **50 / 50** |
| **Total** | **150 / 150** |
| Aprueba (≥100 base) | **Sí — PASS** |

## Specs

| Feature | Status |
|---|---|
| `checkout-ui-mock` | **done** |
| `persistence-seed` | **done** |
| `architecture-hex-rop` | **done** |
| `bonus-hex-rop-polish` | **done** |
| `payment-gateway` | **done** (sandbox live en prod) |
| `api-domains` | **done** |
| `frontend-live-wiring` | **done** |
| `testing-coverage` | **done** |
| `cloud-deploy` | **done** |
| `secrets-vault` | **done** |
| `checkout-payment` | **done** (E2E sandbox cloud; post-pay sync fallback o SQS) |
| `readme-deliverables` | **done** |
| `security-hardening` | **done** (headers FE/API + `docs/security.md`) |
| `sqs-orchestration` | **done** (ADR 0011) |
| `orders-console` | **done** (`/orders` ops demo) |
| `deploy-smoke-rollback` | **done** (ADR 0012 — Playwright + ZAP + CodeQL + rollback) |
| `ux-quality-bar` | **done** (matriz B2–B4 + `docs/ux-evidence.md`) |
| `frontend-hooks-coverage` | **done** (hooks + FE cov ≥80% + `ci:backend-on-fe`) |
| `observability-cloudwatch` | **done** (ADR 0014 — logs + CW dashboard/alarms/IAM viewer) |

## Deploy (live)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| OpenAPI | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |
| Payment mode | `sandbox` |
| Security | [`docs/security.md`](security.md) |
| Observability | [`docs/observability.md`](observability.md) — dashboard `checkout-api-<stage>-ops` |
| UX evidence | [`docs/ux-evidence.md`](ux-evidence.md) |
| CI/CD | [`docs/ci-cd.md`](ci-cd.md) — pre: CodeQL (+Sonar opc.); **BE gate on FE changes**; post: Playwright + ZAP; Artillery opcional |
| Gap analysis | [`docs/brief-gap-analysis.md`](brief-gap-analysis.md) |
| Post-pay | SQS `checkout-orders-events-{stage}` + worker; local sync fallback |
