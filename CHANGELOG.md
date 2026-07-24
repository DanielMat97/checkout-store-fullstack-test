# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
