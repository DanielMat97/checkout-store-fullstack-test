# ADR 0009 — neverthrow as ROP Result library

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

ADR 0002 requires Railway Oriented Programming via `Result` / `Either`. The monorepo already depends on `neverthrow` in `@app/shared` and services. This ADR records the formal choice so new packages do not introduce a second Result type.

## Decision

- Use **`neverthrow`** (`Result`, `ok`, `err`, `andThen`, `map`) for all application use-cases and outbound port return types where domain failure is expected.
- Do not add a competing Result library without a superseding ADR.
- Map `Result` → HTTP only in inbound adapters (controllers/filters).

## Consequences

- Consistent ROP style across microservices and `@app/persistence` repositories.
- Unit tests assert on `isOk` / `isErr` and typed error discriminants — not thrown control flow.
