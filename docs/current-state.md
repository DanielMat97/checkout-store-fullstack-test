# Current state

> Last updated: 2026-07-24

## What exists

| Area | Status |
|---|---|
| Application code (`apps/web`, `services/*`) | **Scaffolded** (health APIs + FE routes) |
| `services/gateway` | **Done** — single entry `:3000`, routes + access logs |
| `packages/shared` | **Done** — logger + `logHttpRequest` + OWASP headers |
| DynamoDB / ElectroDB / seed | Not started (T1) |
| OpenAPI `docs/api/` | Stub `openapi.json` (health only) |
| Deploy (Serverless Framework 4 / AWS) | `serverless.ts` stubs per service; Lambda handler placeholder |
| Public README | Scaffold README present |
| SDD docs (ADRs, specs) | In place |
| Cursor rules + skills | In place (local; gitignored via `.cursor/`) |

## Locked stack (do not change without ADR)

- FE: React SPA + Redux Toolkit + redux-persist, mobile-first
- BE: NestJS microservices (products, customers, deliveries, transactions)
- Architecture: Hexagonal + ROP (`neverthrow`)
- DB: DynamoDB via ElectroDB; seed products; no create-product API
- Deploy: AWS via Serverless Framework 4 (TypeScript) — Nest behind Lambda
- Tests: Jest, >80% FE and BE
- API docs: OpenAPI for Apidog + Nest Swagger / Postman

## Active feature

- `specs/checkout-payment/` — **T0 complete**; next **T1** (ElectroDB + seed)

## Local commands

```bash
npm install
npm run dev          # gateway :3000 + web + 4 Nest APIs
# Try: curl http://localhost:3000/health
#      curl http://localhost:3000/products/health
```

## Next actions

1. T1 — DynamoDB + ElectroDB entities + seed (≥3 products).
2. T2+ — CreateTransaction use-case (ROP) and continue `tasks.md`.
