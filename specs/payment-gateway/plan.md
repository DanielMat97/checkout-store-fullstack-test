---
feature: payment-gateway
derived_from: spec.md
---

# Plan — Payment gateway adapter

## Puerto (ejemplo)

```ts
charge(input: {
  amountMinor: number;
  currency: string;
  // token o datos efímeros — nunca persistir
}): Promise<Result<{ providerRef: string }, PaymentError>>
```

## Adapter

- Lee `PAYMENT_API_URL`, `PAYMENT_PUBLIC_KEY`, `PAYMENT_PRIVATE_KEY`, integrity/events según docs sandbox.
- Timeout corto; errores de red → `ERROR` tipado.
- Fixture/mock in-memory para Jest.

## Seguridad

- Redactar bodies en logs (`packages/shared`).
- Secrets solo env / Secrets Manager en deploy.

## Tasks

Ver `tasks.md`.
