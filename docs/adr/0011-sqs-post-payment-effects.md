# ADR 0011 — SQS for post-payment side effects

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

After a payment is `APPROVED`, the system must (1) decrement product stock and (2) mark the delivery as assignable (`FULFILLABLE`). Doing both inside the `transactions` HTTP Lambda couples bounded contexts and makes retries/idempotency harder.

The brief does **not** require a queue; this ADR records a deliberate enhancement for clearer microservice boundaries.

## Decision

- Publish a `PaymentApproved` event to an SQS queue (`checkout-orders-events-${stage}`) after persisting the transaction as `APPROVED`.
- A dedicated `ordersWorker` Lambda consumes the queue and applies side effects idempotently (`effectsApplied` on the transaction).
- When `ORDERS_EVENTS_QUEUE_URL` is empty (local/offline), apply the **same** side-effect use-case in-process (sync fallback).

## Consequences

- Eventual consistency: FE must poll stock briefly after APPROVED.
- DLQ for poison messages; worker must be idempotent.
- IAM: send from transactions; consume/delete from worker.
