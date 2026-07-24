---
feature: frontend-live-wiring
status: done
owner: frontend
rubric: [3]
---

# Spec — FE live: apagar mock y consumir API

## Resumen

Como cliente, uso la misma UX NORA pero con `VITE_MOCK_MODE=false`, hablando al API Gateway; el pay real crea PENDING, llama pasarela y actualiza stock.

## Alcance

- Cliente HTTP tipado hacia `VITE_API_BASE_URL`.
- Reemplazar `mockPay` / stocks locales por API.
- Mantener validación FE (Luhn, CO phone, etc.).
- Redux-persist sin PAN/CVV.
- CTA exacto **"Pay with credit card"**; summary backdrop fees; status screens.
- Manejo PENDING (polling o await pay response).

## Fuera de alcance

- Rediseño visual (salvo fixes de estados de error de red).
- Cambiar brand NORA.

## Criterios de aceptación (EARS)

- Cuando `VITE_MOCK_MODE=false`, ninguna compra debe mutar stock solo en memoria FE sin éxito de API.
- Cuando Pay sucede, el FE debe mostrar estado PENDING hasta respuesta final.
- Cuando API devuelve APPROVED, Status y producto deben reflejar stock−1.
- Cuando API devuelve DECLINED, stock UI no baja.
- Cuando API está caída, el FE debe mostrar error accionable (reintentar) sin crash.
- Cuando se inspecciona localStorage/persist, no debe haber PAN ni CVV.

## Referencias

- `checkout-ui-mock` (done), `api-domains`, `checkout-payment`
