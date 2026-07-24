---
feature: testing-coverage
derived_from: spec.md
---

# Plan — Testing coverage

## Estrategia

| Área | Prioridad de tests |
|---|---|
| Domain use-cases | Alta (ROP branches APPROVED/DECLINED/stock) |
| Validators FE | Alta |
| Repositories | Media (contrato / local) |
| Controllers | Baja-media (mapping HTTP) |
| UI components | Selectiva (no snapshot spam) |

## Tooling

- Jest + ts-jest (ya parcial).
- Coverage thresholds en jest config ≥80.
- Root script agregador.

## Tasks

Ver `tasks.md`.
