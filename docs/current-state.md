# Current state

> Last updated: 2026-07-24

## Score (rúbrica brief — modo evaluador estricto)

Ver **`docs/scorecard.md`** (protocolo hiring bar + detalle).

| | Estricto |
|---|---|
| Base | **18 / 100** |
| Bonus | **14 / 50** |
| **Total** | **32 / 150** |
| Aprueba (≥100 base) | **No — REJECT** |

Panel: arquitecto / TL / PO / security. Scaffold y mock UI **no** inflan API, tests ni deploy.

## What exists

| Area | Status |
|---|---|
| SDD (`AGENTS.md`, ADRs, specs) | In place (ADR 0001–0007) |
| `specs/checkout-ui-mock/` | **Done** — mock + catalog + redesign |
| `docs/design-system.md` / `docs/scorecard.md` | **Done** |
| `apps/web` mock flow | **Done** — Catalog → Product → Checkout → Summary → Status |
| Root `serverless.ts` | **Done** — HTTP API Gateway → Nest Lambdas |
| Nest microservices | Scaffolded: health + hexagonal folders |
| `packages/shared` | Logger + access logs + OWASP headers |
| DynamoDB / ElectroDB / seed | **Not started** (checkout-payment T1) |
| Real payment / API wiring in FE | Not started (`VITE_MOCK_MODE=false` path) |
| Jest >80% FE+BE | **Far** — smoke tests only |
| AWS deploy | Config ready; not deployed |

## Local

```bash
npm install
npm run dev
# Web mock:  http://localhost:5173
# Flow: Collection → product → Pay with credit card → Summary → Status → product
# Card tip: 4111 1111 1111 1111 / future MM/YY / 123
# API GW:   http://localhost:3000/products/health
```

## Active features

1. `checkout-ui-mock` — **done** (UI scoring path)
2. `checkout-payment` — next **T1** (closes API + onboarding base points)

## Next (máximo impacto en rúbrica)

1. T1–T5 — DynamoDB + ROP use-cases + endpoints + payment adapter (~+25 base, +hex/ROP bonus).
2. Cablear FE al API + sandbox.
3. Jest >80% + cifras README (~+28 base).
4. Deploy AWS + README entregable (~+23 base).

## UX note (2026-07-24)

- Storefront: featured hero + bento grid, sticky nav/dock, shared view-transitions.
- Identity: **NORA Soft** (warm stone + muted clay) — ADR 0008.
- Checkout: **split flow** (product left / form right), modal removed from pay path.
- Responsive: fluid shell padding, clamped heroes, tablet/desktop breakpoints aligned.
- Checkout validation UX: capitalized names, CO phone mask + flag, Bogotá-area city + department suggestions (browser autocomplete off).
