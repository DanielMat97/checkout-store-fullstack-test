---
feature: checkout-payment
derived_from: spec.md
---

# Plan — Onboarding de pago E2E

## Enfoque

No reescribir la UI mock. Completar el **camino de datos**:

```
FE Pay → POST /transactions (PENDING)
      → POST /transactions/:id/pay
      → PaymentGatewayPort (sandbox)
      → update tx + (if APPROVED) delivery + stock--
      → FE poll/GET status → Status screen → Product stock
```

## Capas

| Capa | Dueño |
|---|---|
| Use-cases ROP | `services/transactions` (+ calls a ports de products/deliveries/customers) |
| HTTP | Controllers delgados; OpenAPI en `docs/api/` |
| FE | `VITE_MOCK_MODE=false`; services HTTP; Redux sin PAN/CVV |

## Fees

Env: `BASE_FEE`, `DELIVERY_FEE` (minor units). Total = product + base + delivery.

## Idempotencia

`POST .../pay` sobre tx ya `APPROVED`/`DECLINED` debe ser seguro (no doble decremento).

## Tests mínimos de dominio

- APPROVED decrementa stock exactamente 1.
- DECLINED no muta stock.
- PENDING creado sin llamar gateway.

## Referencias

- Specs hermanos: `payment-gateway`, `api-domains`, `persistence-seed`
- Tasks: `tasks.md` (reordenadas post-mock)
