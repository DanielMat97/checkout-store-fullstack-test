# HashiCorp Vault — secrets for Checkout / NORA

> Feature: `secrets-vault` · ADR: [0010](adr/0010-hashicorp-vault-secrets.md)

## Why

Payment keys and optional AWS deploy credentials stay **out of git**. CI authenticates with **AppRole** and reads KV v2. Local Docker Vault is for seed/export only (`dev` mode).

## KV layout

```
secret/checkout/prod/payment
secret/checkout/prod/app
secret/checkout/prod/aws          # optional

secret/checkout/feature/…         # used by all fb-* deploys
secret/checkout/dev/…             # local
```

Field → env map: `scripts/vault/paths.json` + `scripts/vault/lib.cjs`.

## Local quick start

```bash
# 1) Start Vault (token = root)
npm run vault:up

# 2) Install vault CLI if needed: https://developer.hashicorp.com/vault/install
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root

# 3) Optional: put real payment keys in the shell, then seed
# export PAYMENT_API_URL=… PAYMENT_PUBLIC_KEY=… …
npm run vault:seed                 # seeds dev + prod + feature placeholders
npm run vault:seed -- --stage=prod # one stage

# 4) Export to a gitignored env file
npm run vault:export -- --stage=dev --out=.env.vault
# merge into .env manually, or: set -a && source .env.vault && set +a

# 5) Optional AppRole (mimic CI)
npm run vault:approle
# → prints VAULT_ROLE_ID / VAULT_SECRET_ID (do not commit)
```

`docker compose` service name: `vault` on port **8200**.

## GitHub Actions

Composite action: [`.github/actions/load-vault-secrets`](../.github/actions/load-vault-secrets/action.yml)

Used by `deploy-api.yml` and `deploy-feature.yml`.

### Secrets (minimal)

| Secret | Purpose |
|---|---|
| `VAULT_ADDR` | e.g. `https://vault.example.com` |
| `VAULT_ROLE_ID` | AppRole role id (`checkout-ci`) |
| `VAULT_SECRET_ID` | AppRole secret id |

### Variables

| Variable | Purpose |
|---|---|
| `VAULT_REQUIRED` | `true` to fail deploy when Vault is missing (recommended for prod) |

When Vault is **not** configured, workflows **fill missing** `PAYMENT_*` from legacy GitHub Secrets (fallback). Prefer migrating fully to Vault and setting `VAULT_REQUIRED=true`.

### Remote Vault policy (example)

```hcl
path "secret/data/checkout/*" {
  capabilities = ["read", "list"]
}
path "secret/metadata/checkout/*" {
  capabilities = ["read", "list"]
}
```

Create AppRole `checkout-ci` bound to that policy (see `scripts/vault/bootstrap-approle.sh`).

## Security rules

- Never commit `VAULT_TOKEN`, `VAULT_SECRET_ID`, or payment values.
- Local `root` token is **dev-only**.
- Do not put Vault secrets into Amplify for `VITE_*` (public bundle) — only server-side / CI.
- Repo stays free of payment provider brand names.

## Related

- Deploy runbook: [`deploy.md`](deploy.md)
- Spec: `specs/secrets-vault/`
