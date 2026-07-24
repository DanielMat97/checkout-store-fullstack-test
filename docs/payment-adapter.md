# Payment adapter (sandbox)

Outbound adapter behind `PaymentGatewayPort`. No provider brand names in source.

## Env

| Variable | Purpose |
|---|---|
| `PAYMENT_API_URL` | Base URL including `/v1` (from private brief) |
| `PAYMENT_PUBLIC_KEY` | Tokenize cards |
| `PAYMENT_PRIVATE_KEY` | Create/get transactions |
| `PAYMENT_INTEGRITY_KEY` | SHA-256 integrity signature |
| `PAYMENT_CURRENCY` | Default `COP` |
| `PAYMENT_GATEWAY_MODE` | `sandbox` \| `fake` \| `APPROVED` \| `DECLINED` \| `ERROR` |

## Charge flow (adapter)

1. `GET /merchants/{publicKey}` → acceptance tokens  
2. `POST /tokens/cards` (public key) → card token (PAN never stored)  
3. `POST /transactions` (private key) + integrity signature  
4. Poll `GET /transactions/{id}` → map `APPROVED` / `DECLINED` / `ERROR`

## Local

Use `PAYMENT_GATEWAY_MODE=fake` without sandbox keys. Switch to `sandbox` only with filled env (never commit secrets).
