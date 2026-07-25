---
feature: frontend-hooks-coverage
derived_from: spec.md
---

# Plan — FE hooks + coverage + BE-on-FE gate

1. Hooks: `useCatalog`, `useProductPage`, `useCheckoutForm`, `useSummaryPay`, `usePaymentStatus`, `useOrdersConsole`.
2. Slim pages to presentational wiring.
3. `renderHook` test helper + hook specs; raise Jest FE thresholds to branches 80.
4. `backend-gate-on-fe.cjs` + CI job + `ci:backend-on-fe` script; update `docs/ci-cd.md`.
5. Living docs + format/lint + commit.

## Tasks

Ver `tasks.md`.
