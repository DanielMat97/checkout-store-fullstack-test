# Tasks — checkout-payment (E2E real)

UI mock ya cubierta por `checkout-ui-mock` (done). Estas tasks cierran el **sistema**.

- [x] **T0** — Shared foundation / monorepo (hecho)
- [ ] **CP1** — Integrar create+pay en dominio transactions (usa ports) — deps: persistence-seed, payment-gateway, architecture-hex-rop
- [ ] **CP2** — Idempotencia pay + tests APPROVED/DECLINED stock
- [ ] **CP3** — Contrato FE: estados PENDING→final alineados con API
- [ ] **CP4** — Verificación E2E local sandbox (happy + decline) documentada en current-state
- [ ] **CP5** — Scorecard: criterio #3 re-evaluado con evidencia

Pre-flight: living-docs + OpenAPI si tocó rutas + sin secrets en repo.
