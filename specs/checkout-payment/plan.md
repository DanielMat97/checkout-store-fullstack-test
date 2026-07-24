---
feature: checkout-payment
derived_from: spec.md
---

# Plan técnico — Onboarding de pago

## Arquitectura

- Hexagonal (Ports & Adapters) — ADR 0001.
- Casos de uso con ROP (`neverthrow`) — ADR 0002.
- NestJS por dominio + Serverless Framework 4 → AWS Lambda — ADR 0003, 0005.
- Controllers Nest solo traducen HTTP ↔ caso de uso (`Result` → status codes).

## Modelo de datos (DynamoDB + ElectroDB — ADR 0004)

Resumen (detalle de keys/GSIs en README al implementar):

| Entity | Campos clave |
|---|---|
| `products` | id, name, description, price, stock, imageUrl |
| `customers` | id, name, email, phone |
| `deliveries` | id, transactionId, customerId, address, city, region, fee, status |
| `transactions` | id, status (`PENDING`\|`APPROVED`\|`DECLINED`\|`ERROR`), productId, customerId, amounts (product, baseFee, deliveryFee, total), providerRef, createdAt |

Single-table or per-service tables: decide in implementation; document access patterns.

## Contratos de API

- Fuente de verdad: `docs/api/*.openapi.json` (Apidog) + Nest Swagger; Postman opcional en `.postman/`.
- Endpoints mínimos por dominio:
  - Products/stock: `GET /products/:id`, `GET /products/:id/stock`
  - Customers: `POST /customers`, `GET /customers/:id`
  - Deliveries: `POST /deliveries`, `GET /deliveries/:id`
  - Transactions: `POST /transactions` (→ `PENDING`), `POST /transactions/:id/pay`, `GET /transactions/:id`
- Actualizar OpenAPI en el mismo cambio que cada ruta (regla Apidog).

## Decisiones de librerías

| Concern | Choice |
|---|---|
| Result/Either | `neverthrow` |
| FE state | Redux Toolkit + `redux-persist` (TTL corto; sin PAN/CVV) |
| Persistencia | ElectroDB + DynamoDB |
| Logger | `packages/shared` facade única |
| Security headers | shared middleware helper |
| Lambda adapter | `@codegenie/serverless-express` |

## Fees

- `baseFee`: constante de configuración (siempre).
- `deliveryFee`: constante fija (asumida en spec).
- `total = productPrice + baseFee + deliveryFee`.

## Fuera de este plan

- Reintentos/timeouts avanzados de pasarela (requeriría ADR nuevo).
- Event-driven stock vía SNS/SQS (posible evolución; no requerido).
