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
- Design system docs: `docs/design-system.md`; code in `apps/web/src/design-system/` (tokens, Button, TextField, Modal, Backdrop, etc.).
- Mock checkout flow: product hero, card/delivery modal (Luhn + Visa/MC), summary backdrop with fees, status, stock update; `VITE_MOCK_MODE=true`.

### Changed

- Public HTTP entry is **only** Serverless Framework API Gateway (no custom Express/Nest gateway service).
- Frontend env uses `VITE_API_BASE_URL` + `VITE_MOCK_MODE`.
- Nest apps use `SERVICE_PREFIX` path prefixes aligned with API Gateway routes.
- Web app brand identity: **NORA** (Syne + DM Sans, ink/mist/citrus).

### Removed

- `services/gateway` Express reverse-proxy package (replaced by root `serverless.ts`).
- Placeholder `apps/web/src/pages/*` shells (replaced by feature checkout screens).

### Fixed

- Nest Lambda cold start with platform-express / Express compatibility when wiring serverless-express.
