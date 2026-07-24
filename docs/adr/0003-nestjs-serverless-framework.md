# ADR 0003 — NestJS + Serverless Framework 4 on AWS

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

Brief requires Nest.js (or Grape/Sinatra). Delivery requires cloud deploy; project chose AWS. Serverless Framework 4 is the IaC/deploy tool. Nest and SF4 are complementary, not alternatives.

## Decision

- Each domain service is a **NestJS** application.
- Entry for Lambda: `lambda.ts` bootstraps Nest once (cached) via `@codegenie/serverless-express` (or Nest-recommended adapter).
- Each service has `serverless.ts` (SF4 + TypeScript) targeting API Gateway + Lambda.
- Frontend SPA deployed to S3 + CloudFront via Serverless.
- Do not replace Nest with raw Lambda handlers.

## Consequences

- Cold starts need bundling (esbuild) and adequate memory.
- Local: `serverless-offline` and/or Nest `main.ts` for HTTP.
