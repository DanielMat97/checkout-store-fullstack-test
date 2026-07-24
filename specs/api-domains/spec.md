---
feature: api-domains
status: done
owner: backend
rubric: [4]
---

# Spec — APIs de dominios (products, customers, deliveries, transactions)

## Resumen

Como cliente HTTP, consumo APIs REST bajo un **solo API Gateway** (`serverless.ts`) con los cuatro dominios del brief, headers OWASP, access logs y OpenAPI Apidog-importable.

## Alcance

### Products / stock
- `GET /products` — listado (seed)
- `GET /products/:id`
- `GET /products/:id/stock` (o stock en GET product)

### Customers
- `POST /customers` — crear desde datos de entrega/pago (sin tarjeta)
- `GET /customers/:id`

### Deliveries
- `POST /deliveries` — asociar a transaction/customer (o creado por pay orchestration)
- `GET /deliveries/:id`

### Transactions
- `POST /transactions` — body: productId + customer payload/amounts → `PENDING`
- `POST /transactions/:id/pay` — dispara pasarela; orquesta stock/delivery
- `GET /transactions/:id`

## Fuera de alcance

- `POST /products` (create) — prohibido por brief.
- GraphQL / gRPC.

## Criterios de aceptación (EARS)

- Cuando se llama un endpoint de negocio, la respuesta debe ser JSON coherente con OpenAPI publicado.
- Cuando el controller recibe request, **no** debe contener lógica de negocio (solo map DTO ↔ use-case).
- Cuando ocurre error de validación, debe responder 4xx con cuerpo estable (sin stack traces).
- Cuando se inspeccionan response headers, deben incluir el set OWASP definido en `packages/shared`.
- Cuando se importa `docs/api/openapi.json` en Apidog, todos los endpoints de este spec deben aparecer.

## Referencias

- ADR 0005, 0006
- Scorecard base #4
