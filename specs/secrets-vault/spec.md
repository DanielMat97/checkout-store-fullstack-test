---
feature: secrets-vault
status: done
owner: security
rubric: [B1, 6]
---

# Spec — HashiCorp Vault para secretos / env

## Resumen

Como operador y evaluador de seguridad, los secretos de pago y deploy **no viven** en el repo ni como decenas de GitHub Secrets sueltos: se leen desde **HashiCorp Vault** (KV) en CI/CD y en local opcional.

## Alcance

- Motor KV v2 bajo `secret/checkout/<stage>/…`.
- Auth CI: **AppRole** (solo `VAULT_ADDR`, `VAULT_ROLE_ID`, `VAULT_SECRET_ID` en GitHub Secrets).
- Stages: `prod`, `dev`, `fb-*` (feature usa path `secret/checkout/feature/` o `secret/checkout/<stage>/`).
- Scripts: levantar Vault local, seed de paths, export a `.env` / `GITHUB_ENV`.
- Workflows `deploy-api` / `deploy-feature` cargan secretos desde Vault cuando está configurado; fallback documentado a GitHub Secrets.
- Documentación: paths, políticas mínimas, runbook (`docs/vault.md`).
- **Nunca** commitear tokens root, secret_id, ni valores de pago.

## Fuera de alcance

- Vault Enterprise / namespaces multi-tenant.
- Dynamic DB credentials / Transit encryption de PAN (PAN no se persiste).
- Sustituir Amplify env públicas (`VITE_*` no-secret) — solo secretos sensibles.

## Criterios de aceptación (EARS)

- Cuando CI tiene AppRole configurado, el deploy debe inyectar `PAYMENT_*` (y opcionales AWS) desde Vault **sin** requerir esos valores como GitHub Secrets individuales.
- Cuando un desarrollador corre `npm run vault:up` + `vault:seed` + `vault:export`, debe obtener un `.env` usable en local sin pegar keys en el chat.
- Cuando se inspecciona el repo, no deben existir valores reales de Vault ni payment keys.
- Cuando Vault no está configurado, el workflow debe fallar de forma clara **o** usar fallback GH Secrets (documentar cuál; preferir fail-closed en `prod`).

## Referencias

- Scorecard B1 (secrecy) + cloud-deploy
- ADR 0010 (Vault)
- `docs/deploy.md`
