# ADR 0006 — Single API Gateway entrypoint

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Domain logic is split across Nest microservices (ADR 0005). Exposing a separate API Gateway per service complicates the frontend, CORS, and observability. We need one public HTTP entry that routes to all services and emits standardized access logs.

## Decision

- **One** Serverless Framework HTTP API (API Gateway) owned by `services/gateway`.
- Path-based routing:
  - `/products/**` → products Lambda
  - `/customers/**` → customers Lambda
  - `/deliveries/**` → deliveries Lambda
  - `/transactions/**` → transactions Lambda
- Nest apps use `SERVICE_PREFIX` global prefix matching those paths.
- Gateway access logs: AWS HTTP API execution logs (`provider.logs.httpApi`) + application access logs via `@app/shared` `logHttpRequest` (`service: api-gateway`, correlation id).
- Locally, `services/gateway` runs an HTTP reverse proxy on port **3000** that orchestrates the same routes to local Nest ports 3001–3004.
- Domain `serverless.ts` files do **not** attach their own HTTP API events.

## Consequences

- Frontend uses a single `VITE_API_BASE_URL`.
- Deploy order: build all Nest Lambdas, then deploy `services/gateway`.
- Correlation id (`x-correlation-id`) is generated/propagated at the edge.
