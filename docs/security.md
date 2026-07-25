# Security evidence (cloud)

> Captured: **2026-07-25** · Panel / Observatory substitute via `curl -D-`

## API (HTTPS)

`https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com/products`

| Header | Value |
|---|---|
| `strict-transport-security` | `max-age=31536000; includeSubDomains; preload` |
| `content-security-policy` | `default-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'` |
| `x-content-type-options` | `nosniff` |
| `referrer-policy` | `no-referrer` |
| `x-frame-options` | `DENY` |
| `permissions-policy` | `geolocation=(), microphone=(), camera=()` |
| `cache-control` | `no-store` |
| `cross-origin-resource-policy` | `cross-origin` |
| `cross-origin-opener-policy` | `same-origin` |
| `x-powered-by` | **absent** (stripped) |

Implementation: `applySecuritySurface` (`@app/shared`) on every Nest bootstrap. Catch-all HTTP API routes (`/`, `/{proxy+}`) ensure bare execute-api 404s still hit Nest so HSTS/CORP apply. Amplify SPA headers live in [`customHttp.yml`](../customHttp.yml).

## Frontend (Amplify)

`https://master.dw2i8myh0xumx.amplifyapp.com` — CloudFront HTTPS + `customHttp.yml` (CSP with fallbacks, COOP/COEP/CORP, `Cache-Control: no-store` on HTML, long-cache on `/assets/*`). `robots.txt` / `sitemap.xml` in `apps/web/public`. Vite build injects **SRI** (`scripts/web/inject-sri.cjs`).

Cannot strip CloudFront `Server: AmazonS3` — ZAP rule ignored in [`.zap/rules.tsv`](../.zap/rules.tsv).

## OWASP ZAP baseline

Post-deploy smoke uses `zaproxy/action-baseline` with `.zap/rules.tsv` (ignore CDN/client FP only). Artifacts: `zap-scan-api-*` / `zap-scan-fe-*` (unique names to avoid 409).

## PCI-minded

- PAN/CVV only in memory (`cardSession`); never written to DynamoDB / logs.
- Sandbox keys only in CI secrets / Lambda env (never git).

## Sandbox payment (live)

`POST /transactions/{id}/pay` with `PAYMENT_GATEWAY_MODE=sandbox` → `paymentStatus: APPROVED`, `providerRef` from provider (not `fake_*`), stock decremented.

## Dependency remediation (Dependabot + audit autofix)

- CI `npm run audit` remains **fail-closed** (`scripts/ci/audit-gate.cjs`).
- Weekly **Dependabot** (npm + Actions) + scheduled **`npm audit fix`** PRs on `fix/<slug>` with auto-merge after quality gate (ADR [0017](adr/0017-dependabot-audit-autofix.md)).
- Enable in repo Settings: Dependabot alerts, security updates, **Allow auto-merge**.
- See README section *Dependabot + security audit autofix* and [`docs/ci-cd.md`](ci-cd.md).
