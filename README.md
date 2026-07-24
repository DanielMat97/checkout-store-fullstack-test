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
| **API Gateway** (`serverless offline`) | `http://localhost:3000` |
| Web (Vite) | `http://localhost:5173` |

Examples: `GET /products/health`, `GET /customers/health`, …

Deploy API: `npm run deploy:api`

## Docs

- Agent workflow: `AGENTS.md`
- Current status: `docs/current-state.md`
- OpenAPI: `docs/api/openapi.json` (Apidog)
