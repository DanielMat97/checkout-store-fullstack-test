# AGENTS.md

This project follows **Spec-Driven Development (SDD)**. Before implementing any feature, read in this order:

1. `docs/current-state.md` — what exists today.
2. `docs/adr/` — architecture decisions already taken (do not contradict without a new ADR).
3. `specs/<feature>/spec.md` — what to build.
4. `specs/<feature>/plan.md` — how to build it.
5. `specs/<feature>/tasks.md` — in what order.

Also follow `.cursor/rules/` and the `checkout-flow` skill for locked stack and scoring. UI identity lives in `docs/design-system.md` and `apps/web/src/design-system/`.

## Fixed project rules

- **Hexagonal**: business logic never lives in Nest controllers (ADR 0001).
- **ROP**: use-cases return `Result`/`Either` (e.g. neverthrow), not exceptions for expected flows (ADR 0002).
- **NestJS** is the required app framework; **Serverless Framework 4** creates the **single API Gateway** in root `serverless.ts` (ADR 0006) — no custom gateway service.
- **DynamoDB + ElectroDB** only for persistence (ADR 0004).
- Domain microservices: products, customers, deliveries, transactions behind `/products`, `/customers`, `/deliveries`, `/transactions` (ADR 0005).
- No card data logged or stored in plaintext; `logHttpRequest` (`service: api-gateway`) + OWASP headers on every endpoint.
- New dependencies require an ADR before adding to `package.json`.
- Test coverage must not drop below **80%** (FE and BE).
- Public repo must never contain the payment company brand name; secrets only in env / Secrets Manager.
- Update `docs/api/` OpenAPI (Apidog-importable) on every endpoint create/change.
- **Living docs:** every meaningful change updates `CHANGELOG.md` + `docs/current-state.md` (+ `tasks.md` / OpenAPI / ADR / README as relevant) in the same turn — see `.cursor/rules/living-docs.mdc`.

## If the spec does not cover something

Ask before assuming. If you must assume, write it under **Supuestos** in the feature `spec.md`.
