---
feature: sqs-orchestration
status: ready
owner: fullstack
rubric: [4, B4, B5]
---

# Spec — SQS post-payment orchestration

## Resumen

Tras `APPROVED`, `transactions` publica `PaymentApproved` a SQS; un worker aplica decremento de stock + delivery `FULFILLABLE` de forma idempotente. Sin cola → fallback sync.

## Alcance

- Cola + DLQ en Serverless.
- Publisher port + SQS adapter.
- Worker Lambda + `ApplyPaymentApprovedEffects` use-case.
- Campo `effectsApplied` en transaction para idempotencia.
- Tests con fake publisher / in-process.

## Fuera de alcance

- LocalStack obligatorio.
- EventBridge / SNS fan-out.
- Compensating saga completa multi-paso.

## Criterios de aceptación (EARS)

- Cuando el pago es APPROVED y hay `ORDERS_EVENTS_QUEUE_URL`, el sistema debe persistir APPROVED y encolar el evento **antes** de responder al cliente (efectos async).
- Cuando no hay URL de cola, el sistema debe aplicar stock+delivery en el mismo request (fallback).
- Cuando el worker recibe un mensaje duplicado y `effectsApplied=true`, no debe volver a decrementar stock.
- Cuando el worker falla de forma reintentable, el mensaje permanece / va a DLQ según política SQS.

## Referencias

- ADR 0011, `docs/brief-gap-analysis.md`
