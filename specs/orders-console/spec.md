---
feature: orders-console
status: ready
owner: fullstack
rubric: [3, 4]
---

# Spec — Store ops Orders console

## Resumen

Consola FE `/orders` (sin auth demo) para listar compras `APPROVED`, restaurar stock y marcar deliveries `FULFILLED`. Soporta el journey brief §5–6 con stock visible y gestión operativa.

## Alcance

- `GET /transactions` (filter `status`)
- `POST /transactions/:id/restore` (increment stock + delivery `CANCELLED` + mark restored)
- `PATCH /deliveries/:id` (`FULFILLABLE` → `FULFILLED`)
- FE page + shell “Orders” button
- Poll stock after APPROVED (brief §6)

## Fuera de alcance

- Auth / RBAC
- Real payment refunds at provider
- Creating products

## Criterios de aceptación (EARS)

- Cuando el operador abre Orders, el sistema debe listar transacciones APPROVED con delivery asociada.
- Cuando el operador pulsa Restore stock en una compra no restaurada, el stock del producto debe subir en 1 y la delivery pasar a CANCELLED.
- Cuando el operador marca Fulfilled, la delivery debe pasar a FULFILLED solo desde FULFILLABLE.
- Cuando el comprador vuelve al producto tras APPROVED, el stock mostrado debe refrescarse desde API (con poll corto si efectos son async).

## Referencias

- `docs/brief-gap-analysis.md`, ADR 0011
