# ADR 0010 — HashiCorp Vault for deploy & payment secrets

- Status: Accepted
- Date: 2026-07-24
- Feature: `secrets-vault`

## Context

Payment and AWS deploy credentials must not live in the git repo. Spreading many GitHub Secrets works but is hard to rotate and duplicates per environment (`prod` vs `fb-*`). We need a single source of truth for secrets used by Serverless deploys.

## Decision

Use **HashiCorp Vault** KV v2:

- Paths: `secret/checkout/<stage>/{payment,aws,app}`
- CI auth: **AppRole** (only `VAULT_ADDR`, `VAULT_ROLE_ID`, `VAULT_SECRET_ID` stored in GitHub)
- Local: Vault in Docker (`dev` mode) for seed/export; never commit the root token
- Non-secret config (`CORS_ORIGIN`, `PAYMENT_GATEWAY_MODE`) may live in Vault `app` bundle **or** GitHub Variables

## Consequences

- Positive: rotation in one place; feature vs prod isolation; fewer GH secrets
- Negative: requires a reachable Vault for CI; local docker for developers who want Vault
- Fallback: if Vault is not configured, workflows may use legacy GitHub Secrets (documented)

## Alternatives considered

- AWS Secrets Manager / SSM only — valid, but Vault is the explicit ask and works cross-cloud
- SOPS in git — still puts ciphertext in repo; rotation UX worse for this test
