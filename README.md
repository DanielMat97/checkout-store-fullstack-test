# Checkout Store

Mobile-first SPA to purchase a product with card checkout, delivery data, payment result, and stock update.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React SPA + Redux Toolkit (`apps/web`) |
| Backend | NestJS microservices (`services/*`) |
| HTTP entry | **Serverless Framework 4** HTTP API (one API Gateway) |
| Architecture | Hexagonal + Railway Oriented Programming |
| DB | DynamoDB + ElectroDB |
| Tests | Jest (>80% FE and BE) — see [Coverage](#coverage) |

## Monorepo

```
serverless.ts            # single API Gateway + Lambda routes
apps/web                 # React + Redux
services/products        # /products/**
services/customers       # /customers/**
services/deliveries      # /deliveries/**
services/transactions    # /transactions/**
packages/shared          # logger, access-log middleware, headers
```

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

| Proceso | URL |
|---|---|
| **Web (NORA mock UI)** | `http://localhost:5173` |
| **API Gateway** (`serverless offline`) | `http://localhost:3000` |

Mock checkout: Product → **Pay with credit card** → card/delivery modal → Order summary (backdrop) → Pay → Status → Product (stock updates if approved).  
Test card: `4111 1111 1111 1111`, future `MM/YY`, CVV `123`. Toggle “Simulate declined payment” on summary.

Design system: [`docs/design-system.md`](docs/design-system.md) · Spec: [`specs/checkout-ui-mock/spec.md`](specs/checkout-ui-mock/spec.md)

Deploy API: `npm run deploy:api` · Guide: [`docs/deploy.md`](docs/deploy.md)

### GitHub Actions

| Workflow | When | What |
|---|---|---|
| `CI` | PR / `main` | validate → prettier → lint → audit → test → coverage (**required before deploy**) |
| `Deploy API (prod)` | API changes on `main` | **CI gate first**, then only changed Lambdas (or full stack); secrets from **Vault** |
| `Deploy feature (fb-*)` | branch/tag `fb-*` | **CI gate first**, then isolated API stack + Amplify feature branch |

Frontend production hosting: **AWS Amplify** (connect the repo; use root `amplify.yml`).  
Secrets: [`docs/vault.md`](docs/vault.md) — `npm run vault:up` + AppRole in CI.

## Coverage

Enforced per workspace at **>80% lines**. Snapshot **2026-07-24** (`npm run test:cov`):

| Area | Workspace | Lines |
|---|---|---:|
| Frontend | `@app/web` | **99.65%** |
| Backend | `@app/products` / `customers` / `deliveries` / `transactions` | **84.97–100%** |
| Shared | `@app/shared` / `@app/persistence` | **96.9–97.5%** |

Full table and caveats: [`docs/coverage.md`](docs/coverage.md).

## Docs

- Agent workflow: `AGENTS.md`
- Current status: `docs/current-state.md` (keep in sync while building)
- Deploy runbook: `docs/deploy.md`
- Vault secrets: `docs/vault.md`
- Changelog: `CHANGELOG.md` (update every meaningful change)
- OpenAPI: `docs/api/openapi.json` (Apidog)
