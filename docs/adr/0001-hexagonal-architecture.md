# ADR 0001 — Hexagonal Architecture (Ports & Adapters)

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

The brief requires business logic outside routing/controllers and suggests Hexagonal Architecture. Scoring awards bonus points for Ports & Adapters.

## Decision

Organize every NestJS microservice as:

- `domain/` — entities, value objects, domain errors
- `application/` — use-cases only
- `ports/` — inbound/outbound interfaces
- `adapters/inbound/` — Nest controllers, DTO mapping, HTTP filters
- `adapters/outbound/` — ElectroDB repositories, payment-gateway HTTP client

Controllers only translate HTTP ↔ use-case results. Use-cases depend on ports, never on Nest or AWS SDKs directly.

## Consequences

- Slightly more files per feature; clearer testability and bonus alignment.
- DI wiring via Nest modules binds ports to adapters.
