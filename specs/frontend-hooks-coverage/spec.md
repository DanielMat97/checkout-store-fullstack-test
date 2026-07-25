---
feature: frontend-hooks-coverage
status: done
owner: frontend
rubric: [5, B4]
---

# Spec — FE hooks + coverage ≥80% + BE gate on FE changes

## Resumen

Como líder técnico, veo páginas presentacionales y **hooks** con la lógica (carga, pago, orders), cobertura Jest FE con **stmts/branch/funcs/lines ≥80%**, y un gate de CI/local que, si hay cambios bajo `apps/web/`, corre **test + coverage + audit** del backend Nest.

## Alcance

- Extraer lógica de `CatalogPage`, `ProductPage`, `CheckoutPage`, `SummaryPage`, `StatusPage`, `OrdersPage` a hooks en `features/*/hooks/`.
- Incluir hooks en `collectCoverageFrom`; umbral global FE `{ branches: 80, functions: 80, lines: 80, statements: 80 }`.
- Specs unitarios de hooks (con helper `renderHook` + Redux/Router).
- Script `scripts/ci/backend-gate-on-fe.cjs` + job CI `backend-on-fe` + npm `ci:backend-on-fe`.
- Living docs: INDEX, coverage, ci-cd, CHANGELOG, current-state.

## Fuera de alcance

- Migrar a RTK Query.
- E2E Playwright changes (salvo si rompe por refactors).
- Custom domain Amplify.

## Criterios de aceptación (EARS)

- Cuando se abre un page component de checkout/orders, la lógica async/estado debe vivir en un hook dedicado (page ≈ JSX + wiring).
- Cuando corre `npm run test:cov -w @app/web`, las cuatro métricas globales deben ser ≥80%.
- Cuando hay archivos cambiados bajo `apps/web/`, `npm run ci:backend-on-fe` (y el job CI) debe ejecutar test + test:cov de los 4 Nest services + `npm run audit`.
- Cuando no hay cambios FE, el gate BE-on-FE debe hacer skip exitoso (no fallar el pipeline).

## Referencias

- `.cursor/rules/frontend-react-redux.mdc`, `sdd-workflow.mdc`, `living-docs.mdc`
- `docs/ci-cd.md`, `docs/coverage.md`
