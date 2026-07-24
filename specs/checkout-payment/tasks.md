# Tasks — Onboarding de pago

Orden estricto salvo dependencia explícita. Cada commit: Conventional Commits + `refs specs/checkout-payment/spec.md` + `task: T#`.

- [x] **T0 — Shared foundation**
  - Input: ADR 0003–0005, `.cursor/rules` logging/OWASP
  - Output: monorepo skeleton (`packages/shared` logger + security headers, workspace tooling)
  - Aceptación: logger usable desde un Nest stub; sin `console.log` en shared API

- [ ] **T1 — Modelo de datos y seed**
  - Input: plan.md (modelo), ADR 0004
  - Output: ElectroDB entities + DynamoDB table(s) en Serverless + `npm run seed` (o equivalente)
  - Aceptación: seed deja ≥3 productos con stock > 0; sin endpoint create-product

- [ ] **T2 — Caso de uso CreateTransaction (dominio)**
  - Input: spec.md (PENDING antes de pasarela)
  - Output: use-case puro + tests Jest (ROP)
  - Aceptación: crea `PENDING` sin llamar gateway; coverage del use-case

- [ ] **T3 — Adapter de la pasarela de pago**
  - Input: T2, sandbox env keys (nombres neutros)
  - Output: `PaymentGatewayPort` + adapter outbound
  - Aceptación: mockeable; sin lógica de negocio; sin brand en código

- [ ] **T4 — Orquestación pay + stock/delivery (T7 early)**
  - Input: T2, T3, spec (aprobado vs rechazado)
  - Output: use-case PayTransaction: update tx; si APPROVED → assign delivery + decrement stock
  - Aceptación: test explícito “DECLINED no modifica stock”

- [ ] **T5 — Endpoints HTTP Nest (4 dominios)**
  - Input: T1–T4
  - Output: controllers delgados + OpenAPI `docs/api` + OWASP headers + logger
  - Aceptación: 0 lógica de negocio en controllers; Apidog-importable spec actualizado

- [ ] **T6 — UI: producto + formulario tarjeta/entrega**
  - Input: spec (validación), checkout-validation rule
  - Output: Product page + modal “Pay with credit card” (Luhn + VISA/MC) + delivery fields
  - Aceptación: inválidos no envían; mobile-first sin overflow

- [ ] **T7 — UI: backdrop resumen + persistencia + status**
  - Input: T6, plan (redux-persist)
  - Output: backdrop fees + pay CTA + status screen + redirect con stock
  - Aceptación: refresh no pierde paso; PAN/CVV no en localStorage

- [ ] **T8 — Integración E2E local sandbox + cobertura**
  - Input: T1–T7
  - Output: happy path local; Jest >80% FE y BE; cifras en README
  - Aceptación: reporte coverage documentado

- [ ] **T9 — Deploy AWS (SF4) + README entregable**
  - Input: T8
  - Output: FE+APIs+DynamoDB en AWS; README con modelo, OpenAPI/Postman, URLs, coverage
  - Aceptación: app pública conectada a APIs; checklist rúbrica en skill checkout-flow

## Pre-flight (cada tarea cerrada)

- [ ] Tests pasan; coverage no baja de 80% en paquetes tocados (meta global en T8).
- [ ] Sin secrets hardcodeados.
- [ ] Responsive / a11y básica si tocó FE.
- [ ] **`CHANGELOG.md` actualizado** (Keep a Changelog / Unreleased).
- [ ] **`docs/current-state.md` actualizado** (tabla + Next + fecha).
- [ ] Esta `tasks.md` refleja el progreso (checkbox).
- [ ] OpenAPI/README/ADR si la tarea tocó esos superficies.
- [ ] Commit cita spec + task T#.
