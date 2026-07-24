---
feature: payment-gateway
status: ready
owner: backend
rubric: [3]
---

# Spec — Adapter pasarela de pago (sandbox)

## Resumen

Como sistema, cobro con tarjeta vía **pasarela sandbox** detrás de un puerto hexagonal, sin filtrar marca comercial en código/repo público.

## Alcance

- `PaymentGatewayPort` (charge / tokenize según API sandbox documentada en env).
- Adapter outbound HTTP con keys desde env (`PAYMENT_*` en `.env.example`).
- Mock del puerto para tests unitarios de use-cases.
- Nunca loguear PAN/CVV; no persistir PAN/CVV.

## Fuera de alcance

- Producción live keys.
- UI de tokenización hospedada de terceros (salvo que el sandbox lo exija; entonces encapsular en adapter).

## Criterios de aceptación (EARS)

- Cuando el use-case paga, debe invocar solo el **puerto**, no HTTP directo desde dominio.
- Cuando el sandbox aprueba, el adapter debe mapear a resultado de dominio `APPROVED` + referencia externa.
- Cuando el sandbox rechaza, debe mapear `DECLINED` sin lanzar excepciones de control de flujo (ROP).
- Cuando faltan env keys, el adapter debe fallar de forma explícita al boot o al charge (error tipado).
- Cuando se busca en el repo la marca comercial de la pasarela, **no** debe aparecer en código fuente público.

## Referencias

- ADR 0001, payment-gateway Cursor rule
- `.env.example` nombres neutros
