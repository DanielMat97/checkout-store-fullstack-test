# Checkout Store

Mobile-first SPA to purchase a product with card checkout, delivery data, payment result, and stock update.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React SPA + Redux Toolkit (`apps/web`) |
| Backend | NestJS microservices (`services/*`) |
| Architecture | Hexagonal + Railway Oriented Programming |
| DB | DynamoDB + ElectroDB |
| Deploy | AWS via Serverless Framework 4 |
| Tests | Jest (>80% FE and BE) |

## Monorepo

```
apps/web                 # React + Redux
services/products        # stock / products
services/customers
services/deliveries
services/transactions    # payment orchestration
packages/shared          # logger, security headers, shared types
specs/checkout-payment   # SDD spec / plan / tasks
docs/adr                 # architecture decisions
docs/api                 # OpenAPI (Apidog import)
```

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Levanta a la vez:

| Proceso | URL |
|---|---|
| **API Gateway (único entry)** | `http://localhost:3000` |
| Web (Vite) | Vite default (p.ej. `:5173`) |
| products / customers / deliveries / transactions | `:3001`–`:3004` (solo vía gateway) |

Rutas públicas: `/products/**`, `/customers/**`, `/deliveries/**`, `/transactions/**`, `/health`.
## Docs

- Agent workflow: `AGENTS.md`
- Current status: `docs/current-state.md`
- Feature tasks: `specs/checkout-payment/tasks.md`
- OpenAPI: `docs/api/openapi.json` (import into Apidog)

## Coverage

Document Jest coverage results here after `npm run test:cov` (target >80%).
