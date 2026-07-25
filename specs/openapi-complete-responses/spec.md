---
feature: openapi-complete-responses
status: done
owner: platform
rubric: [api, docs]
---

# Spec — OpenAPI 100% alineado al backend (respuestas por endpoint)

## Resumen

Como evaluador/Apidog, importo `docs/api/openapi.json` y veo **cada path/método** del HTTP API con **schemas + ejemplos de éxito y de todos los códigos de error que el código puede emitir**, sin inventar rutas ni status no cableados en los controllers Nest.

## Alcance

- Auditar controllers + DTOs + `domainErrorToHttp` + `ValidationPipe` en `products`, `customers`, `deliveries`, `transactions` (+ health).
- Reescribir/ampliar `docs/api/openapi.json` y copiar a `apps/web/public/openapi.json`.
- Actualizar `docs/api/smoke.md` si hace falta; living docs + INDEX.
- Format, lint, commit.

## Fuera de alcance

- Generación automática Nest→OpenAPI en CI (opcional futuro).
- Colección Postman (no existe hoy).
- Cambiar contratos HTTP del backend.

## Matriz auditada (controllers → OpenAPI)

| Method | Path | Success | Errors documented |
|---|---|---|---|
| GET | `/products/health` | 200 HealthResponse | — |
| GET | `/products` | 200 ProductListResponse | 500 |
| GET | `/products/{id}` | 200 Product | 404, 500 |
| GET | `/products/{id}/stock` | 200 ProductStockResponse | 404, 500 |
| GET | `/customers/health` | 200 | — |
| POST | `/customers` | 201 Customer | 400, 500 |
| GET | `/customers/{id}` | 200 | 404, 500 |
| GET | `/deliveries/health` | 200 | — |
| POST | `/deliveries` | 201 Delivery | 400, 500 |
| GET | `/deliveries/{id}` | 200 | 404, 500 |
| PATCH | `/deliveries/{id}` | 200 | 400, 404, 422, 500 |
| GET | `/transactions/health` | 200 | — |
| GET | `/transactions` | 200 TransactionListResponse | 500 |
| POST | `/transactions` | 201 CreateTransactionResponse | 400, 404, 409, 500 |
| GET | `/transactions/{id}` | 200 | 400, 404, 500 |
| POST | `/transactions/{id}/pay` | 200 PayTransactionResponse (APPROVED\|DECLINED\|ERROR) | 400, 404, 422, 500, 502 |
| POST | `/transactions/{id}/restore` | 200 RestoreTransactionResponse | 400, 404, 422, 500 |

Error body sources: `packages/shared/src/http/domain-error.mapper.ts`, `validation.ts`.

## Criterios de aceptación (EARS)

- Cuando se importa el OpenAPI, cada ruta presente en los controllers tiene responses documentadas con **content schema** (no solo description vacía).
- Cuando un use-case mapea a 400/404/409/422/500/502, ese status aparece en la operación correspondiente.
- Cuando la validación de DTO falla, el body documentado coincide con `{ error, message, details[] }` del `ValidationPipe`.
- Cuando el dominio falla, el body coincide con `domainErrorToHttp` (`error`, campos tipados).
- Servers incluyen offline + API prod conocida en docs.

## Referencias

- Controllers bajo `services/*/src/adapters/inbound/http/`
- `packages/shared/src/http/domain-error.mapper.ts`, `validation.ts`
- `.cursor/rules/apidog-openapi.mdc`, `living-docs.mdc`
