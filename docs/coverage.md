# Coverage report

> Generated: **2026-07-25**. Metric gate: **statements, branches, functions, lines ≥80%** on every Nest service.  
> Command: `npm run test:cov` (all workspaces).

## Snapshot (backend services)

| Workspace | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| `@app/products` | **98.48** | **100** | **100** | **98.21** |
| `@app/customers` | **100** | **84.61** | **100** | **100** |
| `@app/deliveries` | **100** | **90** | **100** | **100** |
| `@app/transactions` | **100** | **92.85** | **100** | **100** |

## Snapshot (related packages / FE)

| Workspace | Lines | Statements | Branches | Functions |
|---|---:|---:|---:|---:|
| `@app/web` | **99.65** | 98.41 | 88.27 | 100 |
| `@app/shared` | **97.5** | 96.59 | 84.84 | 100 |
| `@app/persistence` | **96.91** | 96.93 | 84.61 | 100 |

**BE Nest services:** all four enforce `coverageThreshold.global` `{ branches: 80, functions: 80, lines: 80, statements: 80 }`.

## Notes

- Collects application/adapter logic; excludes `main`/`lambda`/Nest modules/DTO barrels and UI pages.
- `SandboxPaymentGateway` remains excluded from the transactions **global** threshold (dedicated unit specs for network/poll branches).
- Orders Lambda composition root uses `istanbul ignore next` on the handler wiring; core loop covered via `processOrdersSqsEvent`.

## Reproduce

```bash
npm run test:cov -w @app/products -w @app/customers -w @app/deliveries -w @app/transactions
# or
npm run test:cov
```
