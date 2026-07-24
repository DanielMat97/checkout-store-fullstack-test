# ADR 0004 — DynamoDB + ElectroDB

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Brief allows any DB; recommends PostgreSQL or DynamoDB. Project targets AWS serverless; DynamoDB fits Lambda. ElectroDB chosen as the only interaction layer with DynamoDB.

## Decision

- Persist products/stock, customers, deliveries, transactions in DynamoDB.
- Access exclusively through ElectroDB entities/services inside outbound adapters.
- Prefer single-table (or clear per-service table) design with documented PK/SK/GSIs in README.
- Idempotent seed script for dummy products; no HTTP create-product endpoint.
- Use-cases talk to repository ports only — never raw Document Client or ElectroDB types in domain.

## Consequences

- Access-pattern design required upfront.
- Local/dev needs table provisioning via Serverless resources or scripts.
