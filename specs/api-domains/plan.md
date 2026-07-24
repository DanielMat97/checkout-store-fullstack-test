---
feature: api-domains
derived_from: spec.md
---

# Plan — API domains

## Routing

Root `serverless.ts` ya enruta `/products|customers|deliveries|transactions` → Lambdas Nest.

## Validación

- DTOs class-validator (o Zod) en adapters inbound.
- Use-cases ROP debajo.

## OpenAPI

- Actualizar `docs/api/openapi.json` (o split por servicio + bundle) en el mismo PR que cada ruta.
- Incluir ejemplos APPROVED/DECLINED.

## Errores

Mapa Result → HTTP:

| Dominio error | HTTP |
|---|---|
| Validation | 400 |
| Not found | 404 |
| Conflict (idempotency/stock) | 409 |
| Payment declined | 200/422 según diseño documentado (elegir uno y documentar) |
| Unexpected | 500 sin leak |

## Tasks

Ver `tasks.md`.
