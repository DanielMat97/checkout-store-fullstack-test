# Deploy — AWS (API via GitHub Actions + FE via Amplify)

> Feature: `cloud-deploy` · Last updated: 2026-07-24

## Architecture

| Piece | Owner |
|---|---|
| API (Nest Lambdas + HTTP API + DynamoDB) | **GitHub Actions** + Serverless Framework 4 |
| Frontend (Vite SPA) | **AWS Amplify** (you connect the GitHub repo in Amplify Console) |
| Quality gates | `.github/workflows/ci.yml` |

```
┌─────────────┐     push main      ┌──────────────────┐
│   GitHub    │ ─────────────────► │ deploy-api.yml   │──► API stage prod
│   (main)    │                    │ (changed Lambdas)│
└─────────────┘                    └──────────────────┘
       │
       │  Amplify auto-build (your Amplify app)
       ▼
┌─────────────┐
│ Amplify FE  │  VITE_API_BASE_URL → prod API
└─────────────┘

┌─────────────┐  push fb-42/foo   ┌────────────────────┐
│ fb-* branch │ ────────────────► │ deploy-feature.yml │
└─────────────┘                   │ 1) SF stage fb-…   │──► isolated API+table
                                  │ 2) Amplify branch  │──► isolated FE
                                  └────────────────────┘
```

## Workflows

### 1. `CI` — quality stages

Order: **validate → prettier → lint → audit → test → coverage**

Triggers: PR + push `main`/`master`.

### 2. `Deploy API (prod)`

- Triggers on changes under `services/`, `packages/`, `serverless.ts`.
- Runs the full CI gate first.
- Detects changed services (`scripts/ci/detect-changed-services.cjs`):
  - **functions** mode → `serverless deploy function -f <name>` per Lambda
  - **full** mode → `serverless deploy` when shared/`serverless.ts`/≥3 services change
- Stage: `vars.SERVERLESS_STAGE` (default `prod`).

### 3. `Deploy feature (fb-*)`

Triggers on branches/tags matching:

- `fb-*`
- `fb-*/**` (e.g. `fb-123/checkout-fees`)

Creates a **fully isolated** environment:

1. Serverless stage slug from ref (`fb-123-checkout-fees`)
2. DynamoDB table `checkout-store-<stage>`
3. Fresh API URL + seed
4. Amplify branch with `VITE_MOCK_MODE=false` and `VITE_API_BASE_URL=<feature API>`
5. Starts an Amplify RELEASE job

Tear down later:

```bash
npx serverless remove --stage fb-123-checkout-fees
aws amplify delete-branch --app-id "$AMPLIFY_APP_ID" --branch-name 'fb-123/checkout-fees'
```

## Amplify setup (manual — once)

1. Create an Amplify Hosting app and connect this GitHub repo.
2. Use repo root `amplify.yml` as the build spec.
3. Production branch: `main` (or `master`).
4. Set Amplify env for production:
   - `VITE_MOCK_MODE=false`
   - `VITE_API_BASE_URL=https://<prod-api>.execute-api.<region>.amazonaws.com`
   - `VITE_BASE_FEE=1500` / `VITE_DELIVERY_FEE=5000`
5. Copy the Amplify **App ID** into GitHub Actions variable `AMPLIFY_APP_ID`.
6. Set GitHub variable `CORS_ORIGIN` to the Amplify production URL (comma-separated OK).

Feature branches are created/updated by `deploy-feature.yml` — you do **not** need to pre-create every `fb-*` branch in Amplify.

## GitHub configuration

### Secrets (prefer Vault)

| Secret | Purpose |
|---|---|
| `VAULT_ADDR` / `VAULT_ROLE_ID` / `VAULT_SECRET_ID` | **Preferred** — load `PAYMENT_*` from Vault (see [`vault.md`](vault.md)) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Deploy credentials (or OIDC later) |
| `PAYMENT_*` | **Legacy fallback** if Vault is not configured |

### Variables

| Variable | Example |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `SERVERLESS_STAGE` | `prod` |
| `AMPLIFY_APP_ID` | `d1234abcd` |
| `CORS_ORIGIN` | `https://main.d1234abcd.amplifyapp.com` |
| `PAYMENT_GATEWAY_MODE` | `sandbox` |
| `PAYMENT_GATEWAY_MODE_FEATURE` | `fake` (optional; default for FB stacks) |
| `VAULT_REQUIRED` | `true` to fail deploy when Vault is missing |

### Environments

Create GitHub Environments:

- `production` — protects prod deploy
- `feature` — feature stacks (optional reviewers)

## Local deploy (optional)

```bash
export AWS_REGION=us-east-1
export CORS_ORIGIN=https://your-amplify-url
# payment secrets…
npm run build:api
npx serverless deploy --stage prod
DYNAMODB_TABLE_NAME=checkout-store-prod DYNAMODB_ENDPOINT= npm run seed
```

## Scorecard note

Criterion **#6 Deploy** stays **0** until public FE + API URLs are live and verified. This repo ships the automation; fill URLs in README after the first successful deploy.
