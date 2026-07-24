# Tasks — Maqueta UI mock + Design System

- [x] **U1 — Spec & design system docs**
  - Output: `specs/checkout-ui-mock/*`, `docs/design-system.md`
  - Aceptación: identidad NORA + tokens documentados

- [x] **U2 — Tokens + primitives DS**
  - Output: `apps/web/src/design-system/tokens.css` + Button, TextField, Badge, Surface patterns
  - Aceptación: sin hex sueltos en pages

- [x] **U3 — Patterns Modal + Backdrop + Brand**
  - Output: Modal (a11y), Backdrop, BrandLockup, CardBrandMark, FeeList, Price, StockBadge
  - Aceptación: focus trap + ESC; backdrop scrim

- [x] **U4 — Mock data + checkout service**
  - Output: `mocks/` product seed, fees, submit simulation
  - Aceptación: APPROVED/DECLINED + stock delta

- [x] **U5 — Flujo navegable 5 pantallas**
  - Output: Product, Modal card/delivery, Summary, Status, return stock
  - Aceptación: click-through completo en mock; persist refresh-safe

- [x] **U6 — Validators + tests mínimos**
  - Output: Luhn/expiry/cvv tests; slice test
  - Aceptación: Jest verde en web

- [x] **U7 — Living docs**
  - Output: CHANGELOG, current-state, README mock flag
  - Aceptación: living-docs rule cumplida

- [x] **U8 — Premium visual redesign (ADR 0007)**
  - Output: tokens/fonts/motion, all screens restyled, `withViewTransition`
  - Aceptación: parchment/charcoal + Cormorant/Manrope; visible choreography; reduced-motion OK

- [x] **U9 — Catalog + delivery form fix**
  - Output: `/` collection (4 products), `/product/:id` detail, single-column delivery (no H-scroll)
  - Aceptación: elegir producto antes de pagar; stock por producto; modal sin overflow horizontal
