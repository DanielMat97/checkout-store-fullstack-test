# Tasks — persistence-seed

- [x] **PS1** — ElectroDB models + table resource en `serverless.ts`
- [x] **PS2** — Repository adapters (Dynamo) + ports
- [x] **PS3** — `npm run seed` (≥3 productos, stock > 0, idempotente)
- [x] **PS4** — Tests de repositorio (o contrato) con Dynamo local/mock
- [x] **PS5** — Documentar access patterns en borrador README section (completar en readme-deliverables)

Pre-flight: living-docs; sin AWS keys en repo.

## Cómo correr local

```bash
npm run dynamodb:up
# .env: DYNAMODB_ENDPOINT=http://localhost:8000
npm run ensure-table
npm run seed
```

Modelo: `docs/data-model.md`.
