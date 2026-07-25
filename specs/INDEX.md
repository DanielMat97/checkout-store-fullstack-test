# Specs index — path to 100% (rúbrica)

> Updated: 2026-07-25.  
> Gap analysis: [`docs/brief-gap-analysis.md`](../docs/brief-gap-analysis.md)

## Estado de features

| Feature | Carpeta | Estado | Cierra |
|---|---|---|---|
| UI mock | `checkout-ui-mock/` | **done** | Base #2–3 UI |
| Pago E2E | `checkout-payment/` | **done** | Base #3 |
| Persistencia + seed | `persistence-seed/` | **done** | Base #4 |
| APIs 4 dominios | `api-domains/` | **done** | Base #4 |
| Pasarela sandbox | `payment-gateway/` | **done** | Base #3 |
| FE live | `frontend-live-wiring/` | **done** | Base #3 |
| Cobertura Jest | `testing-coverage/` | **done** | Base #5 |
| Deploy AWS | `cloud-deploy/` | **done** | Base #6 |
| Secrets Vault | `secrets-vault/` | **done** | B1 |
| README | `readme-deliverables/` | **done** | Base #1 |
| Seguridad | `security-hardening/` | **done** | B1 |
| Hex + ROP | `architecture-hex-rop/` | **done** | B5–6 |
| UX quality | `ux-quality-bar/` | **done** | B2–4 |
| Hex + ROP polish | `bonus-hex-rop-polish/` | **done** | B4–6 |
| FE hooks + cov + BE-on-FE | `frontend-hooks-coverage/` | **done** | Base #5 / B4 + CI |
| SQS post-pay | `sqs-orchestration/` | **done** | Arch enhancement (ADR 0011) |
| Orders console | `orders-console/` | **done** | Ops + brief §5–6 stock |
| Deploy smoke + rollback | `deploy-smoke-rollback/` | **done** | CI E2E/ZAP/SAST (ADR 0012) |
| **Observability CW** | `observability-cloudwatch/` | **done** | Logs + dashboards + alarms + IAM (ADR 0014) |
| **Amplify build gate** | `amplify-build-gate/` | **done** | FE Amplify SUCCEED fail-closed (ADR 0015) |
| **OpenAPI complete** | `openapi-complete-responses/` | **done** | All endpoint responses + error schemas |
| **Feature URLs + teardown** | `feature-env-urls-teardown/` | **done** | PR/commit URLs + Amplify VITE sync + Destroy button (ADR 0016) |

## Orden reciente

```
… → openapi-complete-responses → feature-env-urls-teardown
```

## Reglas

1. Leer gap analysis + ADR 0011 antes de tocar pay path.
2. Sin marca de pasarela en source público.
3. Living docs en el mismo cambio.
4. Pipeline post-deploy: ver ADR 0012/0013 + [`docs/ci-cd.md`](../docs/ci-cd.md).
