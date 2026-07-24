# ADR 0002 — Railway Oriented Programming (ROP)

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

The brief suggests ROP for use-cases. Expected domain failures (validation, insufficient stock, declined payment) should not rely on thrown exceptions.

## Decision

- Use `neverthrow` `Result` / `ok` / `err` (or equivalent) in application use-cases.
- Chain with `andThen` / `map`; short-circuit on failure.
- Map `Result` to HTTP in inbound adapters (filters/interceptors), not inside domain logic.
- Stock decrement and fulfillable delivery assignment only on approved payment paths.

## Consequences

- Predictable control flow; easier unit tests for failure branches (critical for >80% coverage).
- Team must avoid mixing throw-based and Result-based styles in the same use-case.
