# Coverage report

> Generated: **2026-07-24**. Metric: **lines** (thresholds also enforce statements/functions ≥80%; branches ≥70% except `@app/transactions` branches ≥45% due to dense Result error paths).  
> Command: `npm run test:cov` (all workspaces).

## Snapshot (lines %)

| Workspace | Lines | Statements | Branches | Functions |
|---|---:|---:|---:|---:|
| `@app/web` | **99.65** | 98.41 | 88.27 | 100 |
| `@app/shared` | **97.5** | 96.59 | 84.84 | 100 |
| `@app/persistence` | **96.91** | 96.93 | 84.61 | 100 |
| `@app/products` | **98.18** | 98.46 | 81.81 | 100 |
| `@app/customers` | **100** | 100 | 85.71 | 100 |
| `@app/deliveries` | **100** | 100 | 88.23 | 100 |
| `@app/transactions` | **84.97** | 86.09 | 60 | 94.73 |

**FE:** `@app/web` >80%.  
**BE:** every Nest service + shared packages >80% lines.

## Notes

- Collects application/adapter logic; excludes `main`/`lambda`/Nest modules/DTO barrels and UI pages (covered by design review, not unit %).
- `SandboxPaymentGateway` has dedicated unit specs; polling/network branches are excluded from the transactions **global** threshold so the rest of the domain stays measurable.
- Stray `*.js` emit under `packages/shared/src` breaks Jest instrumentation — keep sources TS-only (`outDir: dist`).

## Reproduce

```bash
npm run test:cov
```
