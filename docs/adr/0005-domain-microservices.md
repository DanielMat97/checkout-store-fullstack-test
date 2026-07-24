# ADR 0005 — Domain microservices split

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

API must expose stock, transactions, customers, and deliveries with distinct request types. Deploying as one Nest monolith is allowed by the brief but the project chose clearer domain boundaries and independent Serverless deploys.

## Decision

Separate NestJS + SF4 services:

| Path | Domain |
|---|---|
| `services/products` | products + stock |
| `services/customers` | customers |
| `services/deliveries` | deliveries |
| `services/transactions` | transactions + payment orchestration |
| `apps/web` | React SPA |
| `packages/shared` | logger, OWASP headers, shared types, ElectroDB base |

`transactions` owns the payment-gateway adapter and coordinates stock/delivery updates via ports or internal HTTP as documented in the feature plan.

## Consequences

- More deployables and cross-service contracts; higher need for shared OpenAPI and early tests.
- IAM least-privilege per service.
