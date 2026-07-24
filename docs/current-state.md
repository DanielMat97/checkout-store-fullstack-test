# Current state

> Last updated: 2026-07-24

## What exists

| Area | Status |
|---|---|
| SDD (`AGENTS.md`, ADRs, specs) | In place (ADR 0001–0006) |
| `specs/checkout-ui-mock/` | **Done** — full UI/UX mock spec + plan + tasks |
| `docs/design-system.md` | **Done** — NORA identity + tokens + components |
| `apps/web` design system | **Done** — `src/design-system/*` |
| `apps/web` mock flow | **Done** — 5 screens navigable (`VITE_MOCK_MODE=true`) |
| Root `serverless.ts` | **Done** — HTTP API Gateway → Nest Lambdas |
| Nest microservices | Scaffolded: health + hexagonal + lambda |
| `packages/shared` | Logger + access logs + OWASP headers |
| DynamoDB / ElectroDB / seed | **Not started** (checkout-payment T1) |
| Real payment / API wiring in FE | Not started (`VITE_MOCK_MODE=false` path) |
| AWS deploy | Config ready; not deployed |

## Local

```bash
npm install
npm run dev
# Web mock:  http://localhost:5173
# Flow: Product → Pay with credit card → modal → Summary → Pay → Status → Product
# Card tip: 4111 1111 1111 1111 / future MM/YY / 123
# API GW:   http://localhost:3000/products/health
```

## Active features

1. `checkout-ui-mock` — maqueta completa (this delivery)
2. `checkout-payment` — next backend T1

## Next

1. Optionally polish mock a11y tests.
2. `checkout-payment` T1 — DynamoDB + ElectroDB + seed.
3. Keep CHANGELOG + this file updated (living-docs).
