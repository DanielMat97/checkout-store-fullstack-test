# Current state

> Last updated: 2026-07-24

## What exists

| Area | Status |
|---|---|
| Root `serverless.ts` | **Done** — single HTTP API Gateway routing to Nest Lambdas |
| Nest microservices | Scaffolded + `lambda.handler` (serverless-express) |
| Custom Express gateway | **Removed** (routing is Serverless API Gateway only) |
| `packages/shared` | Logger + `logHttpRequest` + access-log middleware + OWASP headers |
| `apps/web` | React + Redux route shells |
| DynamoDB / ElectroDB / seed | Not started (T1) |
| OpenAPI `docs/api/` | Stub with gateway paths |

## Local

```bash
npm install
npm run dev
# API:  http://localhost:3000/products/health
# Web:  http://localhost:5173
```

## Next

T1 — DynamoDB + ElectroDB + seed.
