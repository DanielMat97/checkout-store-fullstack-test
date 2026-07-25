# Security evidence (cloud)

> Captured: **2026-07-25** · Panel / Observatory substitute via `curl -D-`

## API (HTTPS)

`https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com/products`

| Header | Value |
|---|---|
| `strict-transport-security` | `max-age=31536000; includeSubDomains; preload` |
| `content-security-policy` | `default-src 'none'; frame-ancestors 'none'; base-uri 'none'` |
| `x-content-type-options` | `nosniff` |
| `referrer-policy` | `no-referrer` |
| `x-frame-options` | `DENY` |
| `permissions-policy` | `geolocation=(), microphone=(), camera=()` |
| `cache-control` | `no-store` |
| `x-powered-by` | **absent** (stripped) |

Implementation: `applySecuritySurface` (`@app/shared`) on every Nest bootstrap + Amplify `customHeaders` for the SPA.

## Frontend (Amplify)

`https://master.dw2i8myh0xumx.amplifyapp.com` — CloudFront HTTPS; Amplify app custom headers mirror HSTS / CSP / frame / referrer policies (see Amplify Console / `aws amplify get-app`).

## PCI-minded

- PAN/CVV only in memory (`cardSession`); never written to DynamoDB / logs.
- Sandbox keys only in CI secrets / Lambda env (never git).

## Sandbox payment (live)

`POST /transactions/{id}/pay` with `PAYMENT_GATEWAY_MODE=sandbox` → `paymentStatus: APPROVED`, `providerRef` from provider (not `fake_*`), stock decremented.
