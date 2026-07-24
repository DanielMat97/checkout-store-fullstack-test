---
feature: persistence-seed
derived_from: spec.md
---

# Plan — DynamoDB + ElectroDB + seed

## Tabla

- Preferencia: **single-table** `DYNAMODB_TABLE_NAME` (env) con PK/SK ElectroDB; documentar access patterns en README al implementar.
- Local: DynamoDB Local o documento `serverless-dynamodb` / AWS remoto sandbox — decidir en tasks; sin secrets en git.

## Entities (mínimo)

| Entity | PK idea | Atributos |
|---|---|---|
| Product | `PRODUCT#id` | name, description, priceMinor, stock, imageUrl, imageAlt, kicker |
| Customer | `CUSTOMER#id` | fullName, email, phone |
| Delivery | `DELIVERY#id` | transactionId, customerId, address, city, region, feeMinor, status |
| Transaction | `TX#id` | status, productId, customerId, amounts, providerRef, createdAt |

## Seed

- Script TS en monorepo: inserta productos NORA (Aura Quiet, Linen Desk Lamp, Stone Clay Mug, Wool Throw o ≥3).
- Idempotente preferible (put fijo por id).

## Ports

- `ProductRepository`, `CustomerRepository`, `DeliveryRepository`, `TransactionRepository` en hexágono.

## Tasks

Ver `tasks.md`.
