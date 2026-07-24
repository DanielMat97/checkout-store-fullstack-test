# ADR 0006 — Single API Gateway via Serverless Framework

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Domain logic is split across Nest microservices (ADR 0005). We need one public HTTP entry that routes to all services. A custom Node “gateway service” (Express reverse proxy) duplicates what API Gateway already provides.

## Decision

- **Serverless Framework 4** owns the only HTTP API (API Gateway) in root `serverless.ts`.
- Path-based Lambda integrations (no custom gateway microservice):
  - `/products/**` → products Nest Lambda
  - `/customers/**` → customers Nest Lambda
  - `/deliveries/**` → deliveries Nest Lambda
  - `/transactions/**` → transactions Nest Lambda
- Nest apps use `SERVICE_PREFIX` matching those paths; handlers use `@codegenie/serverless-express`.
- Access logs: `provider.logs.httpApi: true` on AWS + app `logHttpRequest` with `service: "api-gateway"` and `targetService` set to the Nest domain.
- Local: `serverless offline` (port 3000) — same routes as AWS. No Express gateway package.

## Consequences

- Frontend uses a single `VITE_API_BASE_URL` (offline or deployed HttpApi URL).
- Deploy: `npm run deploy:api` (build Nest dists, then `serverless deploy`).
- Hot-reload of Nest requires rebuild before offline picks up changes (`npm run build:api`).
