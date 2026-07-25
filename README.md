# Checkout Store (NORA)

Mobile-first SPA to purchase a product with card checkout, delivery data, payment result, and stock update.

## Live URLs

| | URL |
|---|---|
| **Web (Amplify)** | https://master.dw2i8myh0xumx.amplifyapp.com |
| **API (AWS HTTP API)** | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| **OpenAPI (public)** | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |
| Web (local) | `http://localhost:5173` |
| API (local) | `http://localhost:3000` |

Smoke: `GET /products` · full pay path: customer → PENDING transaction → pay → stock update.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React SPA + Redux Toolkit (`apps/web`) |
| Backend | NestJS microservices (`services/*`) |
| HTTP entry | **Serverless Framework 4** HTTP API (one API Gateway) |
| Architecture | Hexagonal + Railway Oriented Programming (`neverthrow`) |
| DB | DynamoDB + ElectroDB — [data model](docs/data-model.md) |
| Tests | Jest (>80% FE and BE) — see [Coverage](#coverage) |
| Secrets | HashiCorp Vault (CI) / env locally — [vault.md](docs/vault.md) |

## Monorepo

```
serverless.ts            # single API Gateway + Lambda routes
apps/web                 # React + Redux
services/products        # /products/**
services/customers       # /customers/**
services/deliveries      # /deliveries/**
services/transactions    # /transactions/**
packages/shared          # logger, validation, OWASP headers
packages/persistence     # ElectroDB single-table
docs/api/openapi.json    # Apidog / OpenAPI 3 (also served at /openapi.json)
```

## Quick start

```bash
cp .env.example .env
npm install
npm run dynamodb:up    # optional local DynamoDB
npm run ensure-table && npm run seed
npm run dev            # API :3000 + web :5173
```

Checkout: Product → **Pay with credit card** → card/delivery modal → Order summary (backdrop) → Pay → Status → Product (stock updates if approved).  
Test card (fake mode): `4111 1111 1111 1111`, future `MM/YY`, CVV `123`.  
Live API: set `VITE_MOCK_MODE=false` and `VITE_API_BASE_URL` to the API URL. Sandbox keys never go in git — see [payment adapter](docs/payment-adapter.md).

Design system: [`docs/design-system.md`](docs/design-system.md)

## API domains

| Prefix | Responsibility |
|---|---|
| `/products` | Catalog + stock |
| `/customers` | Buyer profile |
| `/deliveries` | Shipping address / fulfillment |
| `/transactions` | PENDING create + pay |

Import [`docs/api/openapi.json`](docs/api/openapi.json) in Apidog/Postman, or open the [public OpenAPI](https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json).

## Deploy

| Workflow | When | What |
|---|---|---|
| `CI` | PR / `main`/`master` | validate → prettier → lint → audit → test → coverage → **CodeQL** → SonarCloud (optional) |
| `Deploy API (prod)` | API changes | CI gate → Serverless → **Playwright E2E** + **OWASP ZAP** → **rollback** if smoke fails |
| `Deploy feature (fb-*)` | `fb-*` branches | Isolated API + Amplify → smoke (+ rollback best-effort) |

- Amplify app: `dw2i8myh0xumx` (branch `master`) · build: root `amplify.yml`
- Runbook: [`docs/deploy.md`](docs/deploy.md) · CI/CD smoke+rollback: [`docs/ci-cd.md`](docs/ci-cd.md) · Vault: [`docs/vault.md`](docs/vault.md)
- Local E2E: `FE_BASE_URL=http://localhost:5173 API_BASE_URL=http://localhost:3000 npm run test:e2e`
- Optional: set `FE_BASE_URL`, `SONAR_TOKEN` / `SONAR_ORGANIZATION` / `SONAR_PROJECT_KEY` (see ADR 0012)

## Coverage

Enforced per workspace at **>80% lines**. Snapshot **2026-07-24** (`npm run test:cov`):

| Area | Workspace | Lines |
|---|---|---:|
| Frontend | `@app/web` | **99.65%** |
| Backend | `@app/products` / `customers` / `deliveries` / `transactions` | **84.97–100%** |
| Shared | `@app/shared` / `@app/persistence` | **96.9–97.5%** |

Full table and caveats: [`docs/coverage.md`](docs/coverage.md).  
`SandboxPaymentGateway` has dedicated unit specs (`sandbox-payment.gateway.spec.ts`); polling/network branches stay out of the transactions **global** threshold so domain/use-case lines stay measurable — live sandbox charges are proven in cloud (see [`docs/security.md`](docs/security.md)).

## Docs

- Current status: [`docs/current-state.md`](docs/current-state.md)
- Scorecard (hiring bar): [`docs/scorecard.md`](docs/scorecard.md)
- Data model: [`docs/data-model.md`](docs/data-model.md)
- Payment adapter: [`docs/payment-adapter.md`](docs/payment-adapter.md)
- Security evidence: [`docs/security.md`](docs/security.md)
- CI/CD (E2E + ZAP + rollback): [`docs/ci-cd.md`](docs/ci-cd.md)
- API smoke: [`docs/api/smoke.md`](docs/api/smoke.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
