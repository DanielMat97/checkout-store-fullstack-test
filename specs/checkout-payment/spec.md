---
feature: checkout-payment
status: draft
---

# Spec — Onboarding de pago con tarjeta

## Resumen

Como cliente, quiero comprar un producto pagando con tarjeta de crédito, para recibir el producto con el stock actualizado al finalizar.

## Alcance

- Mostrar producto + stock disponible (descripción, precio).
- Capturar datos de tarjeta y de entrega (modal **"Pay with credit card"**).
- Mostrar resumen de costos (producto + fee base siempre + fee de entrega) en un **backdrop**.
- Procesar el pago contra la pasarela externa (sandbox).
- Reflejar el resultado (éxito/rechazo) y actualizar stock solo si aprobado.
- Flujo de 5 pantallas: Product → Card/Delivery → Summary → Status → Product (stock refreshed).
- App resiliente: recuperar progreso tras refresh.

## Fuera de alcance

- Creación de productos nuevos (DB sembrada).
- Autenticación de usuarios / cuentas persistentes.
- Reembolsos o cancelaciones post-pago.
- Cálculo dinámico de fee de entrega (fee fijo).

## Criterios de aceptación (EARS)

- Cuando el cliente completa el formulario de tarjeta con datos inválidos, el sistema debe bloquear el envío y mostrar el campo con error.
- Cuando el cliente confirma el pago, el sistema debe crear una transacción en estado `PENDING` antes de llamar a la pasarela externa.
- Cuando la pasarela responde aprobado, el sistema debe actualizar la transacción, asignar el producto a entrega y descontar stock, en ese orden.
- Cuando la pasarela responde rechazado, el sistema debe actualizar la transacción **sin** tocar el stock ni crear entrega fulfillable.
- Cuando el cliente refresca la página en cualquier paso del checkout, el sistema debe recuperar el progreso de la transacción en curso (sin PAN/CVV en claro).

## Supuestos / preguntas abiertas

- UX del formulario: un solo paso con validación inline (no wizard multi-step).
- Fee de entrega: fijo (valor concreto en plan/README).
- Fee base: siempre aplicado.
- Detección de logos VISA/Mastercard: incluida (plus del enunciado).
- Dominios API: stock, transactions, customers, deliveries como microservicios Nest.

## Referencias

- ADR: 0001, 0002, 0003, 0004, 0005
- Estado: `docs/current-state.md`
- Rúbrica / brief local: no commitear al repo público
