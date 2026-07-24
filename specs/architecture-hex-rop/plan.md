---
feature: architecture-hex-rop
derived_from: spec.md
---

# Plan — Hex + ROP

## Librería

- `neverthrow` (ADR si aún no añadida formalmente al package — crear ADR 0009 al agregar dep si falta).

## Estructura por servicio

```
services/transactions/src/
  domain/
  application/use-cases/
  adapters/inbound/http/
  adapters/outbound/dynamodb/
  adapters/outbound/payment/
```

## Tasks

Ver `tasks.md` — **empezar antes o en paralelo** con persistence/payment.
