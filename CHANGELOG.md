# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- **README principal**: tono conversacional para el evaluador (menos tablas); Vault cableado pero **opcional por costo**; slots para pantallazos CloudWatch; cada stage de cada pipeline con su razón de ser.

### Added

- **Apidog portal docs + AWS default server**: [`docs/api/apidog.md`](docs/api/apidog.md) documents https://7j6npb6n4w.apidog.io (auto-sync ~every 3h). OpenAPI `servers` default/`baseUrl` = AWS HttpApi prod (not localhost). Spec: `specs/apidog-portal-aws-server/`.
- **Feature env URLs + teardown (ADR 0016)**: sticky PR/commit comments with FE (+ API) URLs after `fb-*` and master deploys; Amplify branch env merge syncs `VITE_API_BASE_URL` to the new Serverless stage; Actions button workflow `destroy-feature.yml` removes SF stack + Amplify branch. Spec: `specs/feature-env-urls-teardown/`.
- **OpenAPI complete responses (v1.0.0)**: every Nest HTTP route documented with success + error schemas/examples matching `domainErrorToHttp` + ValidationPipe; servers offline + prod; synced to `apps/web/public/openapi.json`. Spec: `specs/openapi-complete-responses/`.
- **Amplify build gate (ADR 0015)**: when FE is deployed / FE paths change, Actions waits for Amplify job `SUCCEED` (`wait-amplify-job.cjs`); fails on `FAILED`/`CANCELLED`/timeout. Wired in `deploy-feature.yml` + workflow `amplify-build-gate.yml`. Spec: `specs/amplify-build-gate/`.
- **Observability CloudWatch (ADR 0014)**: enriched JSON logger (`domain`/`layer`/`operation`, HTTP `route`/`statusClass`/`coldStart`, EMF `Checkout/API`); pay use-case `pay.outcome`/`pay.failed`; Serverless dashboard `checkout-api-<stage>-ops`, alarms 4xx/5xx/latency/Lambda errors, SNS + optional email, IAM read-only viewer; `docs/observability.md` + `npm run ops:observability`. Spec: `specs/observability-cloudwatch/`.
- **FE hooks + coverage + BE-on-FE gate**: presentational pages; hooks (`useCatalog`, `useProductPage`, `useCheckoutForm`, `useSummaryPay`, `usePaymentStatus`, `useOrdersConsole`); Jest FE stmts/branch/funcs/lines ≥80%; `npm run ci:backend-on-fe` + CI job. Spec: `specs/frontend-hooks-coverage/`.
- **UX quality bar (B2–B4)**: tokens/veil shadows, overflow SE fixes, Playwright matrix Chromium/Firefox/WebKit + iPhone SE, `docs/ux-evidence.md`. CheckoutPage uses `loadProduct`; unused Modal removed.
- **Hex + ROP polish (B4–B6)**: `GetTransaction`/`ListTransactions` use-cases (controller sin repo); shared `domainErrorToHttp` in `@app/shared`; pay/create/apply-effects railways con `ResultAsync.andThen`.
- **Optional Artillery stress (ADR 0013)**: post-deploy mild load on `GET /products` with `continue-on-error` — never blocks deploy/rollback. Scenario: `load/artillery-products.yml`.
- **Post-deploy smoke + rollback (ADR 0012)**: Playwright E2E + OWASP ZAP after prod/feature deploy; CodeQL (+ optional SonarCloud) in CI quality gate; API rollback to last-good SHA on smoke failure. Specs: `specs/deploy-smoke-rollback/`. Docs: [`docs/ci-cd.md`](docs/ci-cd.md).
- **SQS post-pay orchestration (ADR 0011)**: `PaymentApproved` queue + `ordersWorker`; sync in-process fallback when queue URL empty/offline. Ops console `/orders` (list APPROVED, restore stock, mark fulfilled). APIs: `GET /transactions`, `POST /transactions/:id/restore`, `PATCH /deliveries/:id`. Gap analysis: [`docs/brief-gap-analysis.md`](docs/brief-gap-analysis.md).

### Changed

- Scorecard **2026-07-25**: base **100/100**, bonus **50/50**, total **150/150** — **PASS**. Evidencia: sandbox pay + OWASP + OpenAPI + UX matrix Playwright 4/4 green vs Amplify + hex/ROP polish.
- Prod API: `PAYMENT_GATEWAY_MODE=sandbox` + keys en Lambda/GitHub Secrets (profile `stonestore` / `gh`).
- Security: `applySecuritySurface` (strip `X-Powered-By` + OWASP headers); Amplify `customHeaders`; [`docs/security.md`](security.md).
- CI: quality gate includes CodeQL; deploy-api runs post-deploy Playwright/ZAP with automatic Serverless rollback.
### Added

- **Prod live (AWS profile `stonestore`)**: Amplify FE https://master.dw2i8myh0xumx.amplifyapp.com · API https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com. GitHub Actions secrets/vars (`AWS_*`, `AMPLIFY_APP_ID`, `CORS_ORIGIN`, …) configurados vía `gh` + profile `stonestore`.

### Fixed

- CI coverage gate for `@app/transactions`: unit tests for orders-worker, in-process publisher, apply/restore error paths (lines were ~75% after SQS/ops).
- Amplify build: removed `AMPLIFY_MONOREPO_APP_ROOT` (error “Monorepo spec without applications”).
- Lambda Node 24: upgraded `@codegenie/serverless-express@5` + async-only handlers (callback handlers rejected by runtime).
- Serverless Outputs: dropped custom `HttpApiUrl` that collided with Framework-generated output (invalid CFN Value map).

### Added

- Spec-Driven Development scaffolding: `AGENTS.md`, ADRs 0001–0006, `specs/checkout-payment/` (spec/plan/tasks), `docs/current-state.md`.
- Cursor rules and skills for locked stack (NestJS, Hexagonal, ROP, DynamoDB/ElectroDB, SF4, Jest >80%).
- SDD workflow + **living-docs** Cursor rules (CHANGELOG / current-state / OpenAPI must stay in sync with code).
- Monorepo scaffold (T0): `packages/shared`, Nest microservices (`products`, `customers`, `deliveries`, `transactions`), React+Redux `apps/web`.
- Root `serverless.ts`: single Serverless Framework HTTP API Gateway routing `/products|customers|deliveries|transactions` to Nest Lambdas; local via `serverless offline` (`npm run dev`).
- Shared logging: `createLogger`, `logHttpRequest` (`service: api-gateway`, `message: http.request`), Nest `AccessLogMiddleware`, `NestStandardLogger`.
- OWASP security headers middleware on all Nest routes; OpenAPI stub in `docs/api/openapi.json` (Apidog-importable).
- **NORA UI mock feature** (`specs/checkout-ui-mock/`): full 5-screen navigable mock + centralized design system.
- Design system docs: `docs/design-system.md`; code in `apps/web/src/design-system/` (tokens, Button, TextField, Modal, Backdrop, motion, etc.).
- ADR 0007 — premium ecommerce visual system (Apple × Aesop × Glossier inspiration).
- Mock checkout flow: product hero, card/delivery modal (Luhn + Visa/MC), summary backdrop with fees, status, stock update; `VITE_MOCK_MODE=true`.
- Rubric autoevaluación vs brief: `docs/scorecard.md` (protocolo evaluador estricto hiring-bar; corte actual **32/150**).
- Cursor rule `scorecard-evaluator.mdc`: always grade as harsh hiring panel (architect / TL / PO / security).
- Specs path-to-100%: `specs/INDEX.md` + features `persistence-seed`, `payment-gateway`, `api-domains`, `frontend-live-wiring`, `testing-coverage`, `cloud-deploy`, `readme-deliverables`, `security-hardening`, `architecture-hex-rop`, `ux-quality-bar` (SDD only; no impl yet). `checkout-payment` refreshed; `checkout-ui-mock` marked **done**.
- **`@app/persistence`**: ElectroDB single-table (Product/Customer/Delivery/Transaction), repository ports + adapters (`Result`/`neverthrow`), DynamoDB table in `serverless.ts`, `docker compose` DynamoDB Local, `npm run ensure-table` + `npm run seed` (4 NORA products). Access patterns: `docs/data-model.md`.
- **Hex + ROP** (`architecture-hex-rop`): ADR 0009 (`neverthrow`); `CreateTransaction` / `PayTransaction` use-cases with port fakes (DECLINED no decrementa stock); thin HTTP controllers; minimal use-cases in products/customers/deliveries; OpenAPI paths updated. Payment still `FakePaymentGateway` until `payment-gateway`.
- **Payment sandbox adapter** (`payment-gateway`): `SandboxPaymentGateway` (acceptance → tokenize → create tx → poll), integrity SHA-256, env-only keys, Nest wiring (`PAYMENT_GATEWAY_MODE=sandbox|fake`). Docs: `docs/payment-adapter.md`. Zero provider brand in public source.
- **API domains**: DTOs + global `ValidationPipe` (stable 400 body), `GET /products/:id/stock`, `POST /deliveries`, 201 on creates, OpenAPI 0.3 with schemas/examples, smoke guide `docs/api/smoke.md`, `useDotenv: true` in `serverless.ts`.
- **FE live wiring**: `apps/web/src/api/*` + `checkoutApi.executePay` (customer → PENDING tx → pay → refresh stock); `cardSession` ephemeral PAN/CVV; catalog/product load from API when `VITE_MOCK_MODE=false`; Status ERROR + Retry. Checkout form hydrates from Redux + `peekPendingCard` on “Edit details”; product/status pages sync stock from API after APPROVED (no SQS — brief is sync step 5.x).

- **Testing coverage** (`testing-coverage`): Jest thresholds >80% lines FE+BE; `npm run test:cov` green; figures in README + `docs/coverage.md`. Fixed shared instrumentation (stray `.js` next to `.ts`).
- **Cloud deploy automation** (`cloud-deploy`): GitHub Actions CI (validate/prettier/lint/audit/test/coverage), selective Lambda deploy on `main`, feature stacks for `fb-*` + Amplify branch job. Runbook: `docs/deploy.md`. Public URLs still pending (scorecard #6 = 0).
- **HashiCorp Vault** (`secrets-vault`): KV v2 paths `secret/checkout/<stage>/{payment,app,aws}`, local Docker + seed/export, CI AppRole via `.github/actions/load-vault-secrets`, ADR 0010. Docs: `docs/vault.md`.

### Changed

- Public HTTP entry is **only** Serverless Framework API Gateway (no custom Express/Nest gateway service).
- Frontend env uses `VITE_API_BASE_URL` + `VITE_MOCK_MODE`.
- Nest apps use `SERVICE_PREFIX` path prefixes aligned with API Gateway routes.
- Web visual system redesigned per ADR 0007: Apple × Aesop × Glossier (parchment/charcoal, Cormorant + Manrope, sharp geometry, blush ambient).
- Premium motion language: staggered reveals, sheet/modal entrances, hero kenburns, status spinner/shake, `withViewTransition` on route changes; `prefers-reduced-motion` honored.
- Checkout UX: catalog of 4 products → product detail → checkout; delivery form single-column (no horizontal scroll); per-product stock in Redux.
- Storefront composition: featured hero + bento grid (not vertical stack), sticky nav/dock, shared view-transitions, kenburns ambient motion.
- **NORA Pop** palette (coral/mint/cream, Fraunces+Outfit) + **split checkout** (product slides left, form from right; no pay modal). ADR 0008.
- **NORA Soft** refine: muted clay accent, calmer surfaces; responsive layout pass (fluid padding, hero clamps, split ≥960px, summary centering).
- Checkout form polish: title-case names, strict email, CO phone (+57 flag + mask), city/department suggest lists with browser autocomplete disabled.
- CVV masked as password with eye toggle to reveal; max 3 digits; input sanitizers/limits per field.

### Removed

- `services/gateway` Express reverse-proxy package (replaced by root `serverless.ts`).
- Placeholder `apps/web/src/pages/*` shells (replaced by feature checkout screens).

### Fixed

- Nest Lambda cold start with platform-express / Express compatibility when wiring serverless-express.
