---
name: checkout-flow
description: >-
  Full checkout app business spec (5-screen payment onboarding, product, stock,
  delivery, NestJS microservices). Use ALWAYS when creating or modifying any
  screen, endpoint, data model, test, or deploy step in this project.
---

# Checkout App — Spec de negocio

## Flujo de negocio (5 pantallas, en orden estricto)

1. Product page: muestra producto + stock disponible (descripción, precio).
2. Credit Card / Delivery info: modal **"Pay with credit card"** → datos de tarjeta (validar estructura, detectar VISA/MasterCard) + datos de entrega.
3. Summary: resumen dentro de un componente **backdrop** (monto producto + fee base fijo + fee de entrega) con botón de pago.
4. Final status: resultado de la transacción (aprobada / rechazada).
5. Product page: redirección con stock actualizado.

## Al hacer clic en "Pagar"

1. Crear transacción `PENDING` en el backend propio → obtener número de transacción.
2. Llamar a la API de pagos externa (sandbox) para completar el pago.
3. Al resolver:
   - **Siempre** actualizar la transacción con el resultado (éxito o fallo).
   - **Solo si aprobada:** asignar el producto a entregar **y** actualizar el stock.
   - Si rechazada/error: no decrementar stock ni crear entrega fulfillable.

## Entidades / recursos de API requeridos

- `stock` → `services/products` (NestJS)
- `transactions` → `services/transactions` (NestJS)
- `customers` → `services/customers` (NestJS)
- `deliveries` → `services/deliveries` (NestJS)

Cada servicio = app NestJS + Hexagonal + ROP, desplegada con Serverless Framework 4 a AWS Lambda. Persistencia: DynamoDB vía ElectroDB.

## Stack bloqueado de este proyecto

| Capa | Elección |
|---|---|
| Frontend | React SPA + Redux (Flux), mobile-first |
| Backend | NestJS + Hexagonal + ROP (neverthrow o equivalente) |
| DB | DynamoDB + ElectroDB, seed de productos (sin endpoint create-product) |
| Docs API | OpenAPI en `docs/api/` (importable en Apidog) + Swagger Nest; actualizar en cada ruta |
| Logs | Logger único en `packages/shared` |
| Seguridad | OWASP headers en cada endpoint; no loguear PAN/CVV |
| Deploy | AWS vía Serverless Framework 4 (TypeScript) |
| Tests | Jest, >80% FE y BE; documentar en README |

## Restricciones técnicas obligatorias

- SPA React únicamente en este repo. Mobile-first, responsive (mín. iPhone SE 2020), sin desbordes; imágenes rápidas.
- Redux + persistencia segura del checkout (state / localStorage) — resiliente a refresh. Nunca persistir PAN/CVV en claro.
- Lógica de negocio SIEMPRE fuera de controllers Nest — Ports & Adapters.
- Casos de uso con Railway Oriented Programming (`Result`/`Either`, no excepciones para flujo de negocio esperado).
- Repo público: **nunca** la marca de la compañía de pagos; secrets solo en `.env` / Secrets Manager.
- Variables de entorno sandbox: `PAYMENT_PUBLIC_KEY`, `PAYMENT_PRIVATE_KEY`, `PAYMENT_EVENTS_KEY`, `PAYMENT_INTEGRITY_KEY` (nombres neutros; nunca hardcodear).

## Checklist de rúbrica (antes de dar por terminada una feature)

- [ ] README completo (modelo DynamoDB, endpoints/OpenAPI, cobertura)
- [ ] Imágenes optimizadas, sin desbordes de UI
- [ ] Onboarding de pago con tarjeta 100% funcional (5 pantallas)
- [ ] API completa y validada (stock, transactions, customers, deliveries)
- [ ] OpenAPI/`docs/api` actualizado (Apidog) si hubo cambios de rutas
- [ ] Cobertura de tests >80% (front y back)
- [ ] Desplegado en AWS (SF4) y accesible públicamente
- [ ] (Bonus) Headers de seguridad + HTTPS + OWASP
- [ ] (Bonus) Responsive real en varios navegadores + CSS pulido
- [ ] (Bonus) Hexagonal + ROP + código limpio

## Relación con reglas del proyecto

Seguir siempre `.cursor/rules/` (overview, NestJS+SF4, ElectroDB, logging, Apidog, OWASP). Esta skill es el spec de negocio; las rules son las convenciones de implementación.
