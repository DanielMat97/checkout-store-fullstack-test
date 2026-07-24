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
| Tests | Jest (>80% FE and BE) |

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

Deploy API: `npm run deploy:api`

## Docs

- Agent workflow: `AGENTS.md`
- Current status: `docs/current-state.md` (keep in sync while building)
- Changelog: `CHANGELOG.md` (update every meaningful change)
- OpenAPI: `docs/api/openapi.json` (Apidog)
