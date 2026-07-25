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

### 1. `CI` — quality stages (required before deploy)

Order: **validate → prettier → lint → audit → test → coverage → quality-ok**

Triggers: PR + push `main`/`master`.

**Deploy is fail-closed:** `deploy-api.yml` and `deploy-feature.yml` call this workflow via `workflow_call` and only continue when `needs.quality.result == 'success'`. If any quality job fails, detect/deploy are **skipped** (no partial deploy).

Local equivalent:

```bash
npm run ci
```

### 2. `Deploy API (prod)`

- Triggers on changes under `services/`, `packages/`, `serverless.ts`.
- **Runs the full CI gate first** (required).
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
4. Amplify branch with merged env (`VITE_MOCK_MODE=false`, `VITE_API_BASE_URL=<feature API>`, fees) via `amplify-sync-branch-env.cjs`
5. Starts an Amplify RELEASE job
6. Sticky **PR/commit comment** with FE + API URLs + link to **Destroy feature stack**

### Tear down (Actions button)

1. GitHub → **Actions** → **Destroy feature stack** → **Run workflow**
2. `ref_name`: e.g. `fb-123/checkout-fees`
3. `confirm`: exactly `destroy`

This runs `serverless remove --stage <slug>` and `aws amplify delete-branch`. Refuses non-`fb-*` and protected stage names.

Manual CLI (equivalent):

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

### Live (account `stonestore` / Amplify app `dw2i8myh0xumx`)

| | URL |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |

Smoke: `GET /products` returns seeded catalog (200).

GitHub (`DanielMat97/checkout-store-fullstack-test`) variables/secrets for Actions were configured with AWS profile **`stonestore`** (`AWS_*` secrets + `AMPLIFY_APP_ID`, `CORS_ORIGIN`, `AWS_REGION`, `SERVERLESS_STAGE`, `PAYMENT_GATEWAY_MODE=fake`).

Feature branches are created/updated by `deploy-feature.yml` — you do **not** need to pre-create every `fb-*` branch in Amplify.

### Amplify build gate (fail-closed)

After kicking a RELEASE (feature) or on FE path pushes to `main`/`master`, GitHub Actions waits until Amplify reports **`SUCCEED`**. `FAILED` / `CANCELLED` / timeout fail the stage. See [`docs/ci-cd.md`](ci-cd.md) and ADR 0015 / **0016** (URL comments + destroy).

Prod API deploy also **re-syncs** Amplify prod branch `VITE_API_BASE_URL` to the live HttpApi URL and comments the FE URL on the commit.

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
