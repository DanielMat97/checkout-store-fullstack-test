---
feature: checkout-payment
status: ready
owner: fullstack
rubric: [3]
---

# Spec — Onboarding de pago E2E (sistema real)

## Resumen

Como cliente, compro un producto con tarjeta: el **backend** crea `PENDING`, llama la pasarela sandbox, actualiza tx/delivery/stock y el FE muestra el resultado con stock fresco.

## Alcance

- Flujo de negocio brief (5 pantallas): Product → Card/Delivery → Summary (backdrop) → Status → Product.
- UI existente (split checkout, catálogo) se **reutiliza**; este spec exige **cableado real** (ver `frontend-live-wiring`).
- Transacción `PENDING` **antes** de la pasarela.
- Aprobado → update tx + delivery + decrement stock.
- Rechazado → update tx **sin** tocar stock.
- Fees: `product + baseFee (siempre) + deliveryFee`.
- Persistencia FE sin PAN/CVV.

## Fuera de alcance

- Alta de productos (seed).
- Auth de usuarios.
- Reembolsos.
- Modal legacy (reemplazado por split flow ADR 0008).

## Criterios de aceptación (EARS)

- Cuando el cliente pulsa **Pay** en el summary, el sistema debe crear una transacción `PENDING` en el backend **antes** de invocar la pasarela.
- Cuando la pasarela aprueba, el sistema debe persistir `APPROVED`, asociar delivery al customer/producto y decrementar stock en 1.
- Cuando la pasarela rechaza, el sistema debe persistir `DECLINED` y el stock del producto debe permanecer igual.
- Cuando el FE muestra Status y vuelve al producto, el stock visible debe coincidir con DynamoDB.
- Cuando falla la pasarela por error técnico, el sistema debe marcar `ERROR` (o equivalente) sin decrementar stock.
- Cuando el usuario refresca mid-flow, el progreso seguro (sin PAN/CVV) se restaura.

## Dependencias de specs

- `persistence-seed`, `payment-gateway`, `api-domains`, `frontend-live-wiring`.

## Referencias

- ADRs 0001–0006, 0008
- Brief proceso de negocio § pasos 5.x
- `docs/scorecard.md` criterio base #3
