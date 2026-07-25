# Coverage report

> Generated: **2026-07-24**. Metric gate: **statements, branches, functions, lines ≥80%** on every Nest service, `@app/web`, `@app/shared`, and `@app/persistence`.  
> Command: `npm run test:cov` (all workspaces).

## Snapshot (frontend)

| Workspace | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `@app/web` | **94.57** | **82.55** | **97.84** | **95.54** |

FE collects API, checkout/orders hooks + pure modules, mocks, store, format. Pages (`.tsx`) stay presentational.

## Snapshot (backend services)

| Workspace | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `@app/products` | **98.48** | **100** | **100** | **98.21** |
| `@app/customers` | **100** | **84.61** | **100** | **100** |
| `@app/deliveries` | **100** | **90** | **100** | **100** |
| `@app/transactions` | **100** | **92.85** | **100** | **100** |

## Snapshot (shared packages)

| Workspace | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `@app/shared` | **100** | **96.55** | **100** | **100** |
| `@app/persistence` | **100** | **95.74** | **100** | **100** |

**Gates:** Nest + web + shared packages enforce `{ branches: 80, functions: 80, lines: 80, statements: 80 }`.

## Notes

- FE hooks live under `features/*/hooks/` with unit specs via `@testing-library/react` + `src/test/renderHook.tsx`.
- When `apps/web/` changes, `npm run ci:backend-on-fe` runs Nest test + cov + audit (see `docs/ci-cd.md`).
- `SandboxPaymentGateway` remains excluded from the transactions **global** threshold.

## Reproduce

```bash
npm run test:cov -w @app/web
npm run test:cov -w @app/shared -w @app/persistence
npm run test:cov -w @app/products -w @app/customers -w @app/deliveries -w @app/transactions
npm run ci:backend-on-fe
```
