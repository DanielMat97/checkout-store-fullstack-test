---
feature: secrets-vault
derived_from: spec.md
---

# Plan — Vault KV + AppRole + CI

## Layout KV v2

```
secret/checkout/prod/payment     → PAYMENT_*
secret/checkout/prod/aws         → AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (opcional)
secret/checkout/prod/app         → CORS_ORIGIN, PAYMENT_GATEWAY_MODE, …

secret/checkout/feature/payment  → mismos keys (sandbox/fake para FB)
secret/checkout/feature/app      → …

secret/checkout/dev/…            → local / stage dev
```

Path helper: `secret/data/checkout/<stage>/<bundle>` (API KV v2).

## Auth

| Actor | Método |
|---|---|
| GitHub Actions | AppRole (`checkout-ci`) |
| Local docker | Token root **solo** en máquina local (dev mode); seed con `VAULT_DEV_ROOT_TOKEN_ID` |

## Componentes a entregar

1. `docker-compose` servicio `vault` (dev).
2. `scripts/vault/*.cjs` — seed, export-env, path map.
3. Composite / steps en workflows usando `hashicorp/vault-action`.
4. `docs/vault.md` + update `docs/deploy.md`.
5. ADR 0010.

## Fail policy

- `prod` deploy: **require Vault** if `VAULT_ADDR` secret is set; else fallback GH Secrets with warning.
- Feature: prefer `secret/checkout/feature/*`; fallback same as prod.

## Tasks

Ver `tasks.md`.
