---
feature: bonus-hex-rop-polish
status: done
owner: backend
rubric: [B4, B5, B6]
---

# Spec — Hexagonal + ROP polish (bonus max)

## Resumen

Como arquitecto/hiring bar, veo controllers **sin repos**, use-cases Get/List en transactions, mapeo de errores compartido, y railways con `andThen` en pay/create/effects — no solo `Result` + `if (isErr)`.

## Alcance

- `GetTransactionUseCase` + `ListTransactionsUseCase`; controller sin `TRANSACTION_REPOSITORY`.
- `domainErrorToHttp` en `@app/shared` usado por products/customers/deliveries/transactions.
- Products controller: distinguir NOT_FOUND vs PERSISTENCE.
- Refactor `PayTransactionUseCase` / `CreateTransactionUseCase` / `ApplyPaymentApprovedEffectsUseCase` a cadenas `andThen`.
- Tests actualizados.

## Fuera de alcance

- Reescribir todos los use-cases menores a andThen.
- Cambiar contrato HTTP.

## Criterios de aceptación (EARS)

- Cuando se abre `transactions.controller.ts`, no debe inyectar el repositorio de transacciones.
- Cuando products falla por persistencia, no debe mapearse siempre a 404.
- Cuando se lee pay/create, debe haber composición railway (`andThen` / `map`) visible.
- Cuando el scorecard evalúa B5/B6, debe citar estos use-cases + tests.

## Referencias

- ADR 0001, 0002, 0009
- `specs/architecture-hex-rop/`
