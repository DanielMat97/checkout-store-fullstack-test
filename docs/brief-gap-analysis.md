# Brief gap analysis — fullstack test vs repo

> Date: **2026-07-25** · Source: `docs/fullstack-test.md` (local only; do not publish secrets).  
> Purpose: map every brief requirement to evidence, gaps, and specs.

## Legend

| Status | Meaning |
|---|---|
| **done** | Evidencia ejecutable / docs públicos |
| **partial** | Existe pero incompleto o frágil |
| **new** | No está en el brief; pedido del equipo (SQS / Orders console) |
| **n/a** | No requerido por el brief |

## Proceso de negocio (pasos 1–6)

| Paso brief | Evidencia | Status | Spec / notas |
|---|---|---|---|
| 1 UI producto + stock | Catalog/Product pages; API `GET /products` | **done** | `checkout-ui-mock`, `frontend-live-wiring` |
| 2 Pay with credit card | CTA → checkout flow | **done** | ADR 0008 split checkout |
| 3 Card + delivery validated + brands | Luhn, Visa/MC marks, delivery DTO | **done** | `frontend-live-wiring` |
| 4 Summary backdrop + fees | `SummaryPage` + FeeList | **done** | |
| 5.1 PENDING before gateway | `CreateTransaction` → PENDING | **done** | `checkout-payment` |
| 5.2 Call payment sandbox | `SandboxPaymentGateway` | **done** | `payment-gateway` |
| 5.3a Update tx result | APPROVED/DECLINED/ERROR | **done** | |
| 5.3b Assign product to customer (delivery) | Delivery `FULFILLABLE` | **partial** → **new SQS** | Sync today; move to worker via `sqs-orchestration` |
| 5.3c Update stock | `decrementStock` | **partial** → **new SQS** | Same; FE poll for eventual consistency |
| 6 Status → product with fresh stock | Status/Product refresh | **partial** | Strengthen poll in `orders-console` / FE wiring |

## Responsabilidades del candidato

| Requisito | Status | Evidencia / gap |
|---|---|---|
| API design + data model | **done** | `docs/data-model.md`, ElectroDB |
| OpenAPI / Postman-like public | **done** | `/openapi.json` on Amplify |
| Endpoint validations | **done** | DTOs + ValidationPipe |
| Sensitive card data | **done** | `cardSession` memory-only; never DynamoDB |
| Domains: stock, tx, customers, deliveries | **done** | 4 Nest services |
| UI stock display | **done** | |
| Resilient mid-flow (refresh) | **partial** | Redux-persist without PAN; card must re-enter after full reload |
| 5-screen flow | **done** | |

## Stack / rúbrica

| Ítem | Status | Spec |
|---|---|---|
| React SPA + Redux | **done** | |
| Mobile-first | **partial** | `ux-quality-bar` still ready (matrix) |
| Nest + Hex + ROP | **done** | `architecture-hex-rop` |
| DynamoDB seed | **done** | `persistence-seed` |
| Jest >80% FE+BE | **done** | `testing-coverage` |
| Cloud deploy | **done** | `cloud-deploy` |
| OWASP/HTTPS | **done** | `security-hardening` |
| No provider brand in public repo | **done** | |

## Gaps explícitos (brief)

1. **Resilience:** full page reload mid-checkout loses PAN (acceptable PCI); delivery/meta restore OK.
2. **Responsive matrix / multi-browser evidence:** `ux-quality-bar` still open (bonus).
3. **Post-pay effects** were sync inside transactions service — weak boundary for “microservices”; addressed by **SQS** (team enhancement).

## Enhancements (not in brief) — this delivery

| Feature | Spec | Why |
|---|---|---|
| SQS post-pay orchestration | `sqs-orchestration` | Cross-service stock + delivery without coupling in HTTP pay path |
| Store ops Orders console | `orders-console` | List purchases, restore stock, mark fulfilled |

## Definition of done for this delivery

- [ ] Gap doc + specs + ADR 0011 merged into INDEX
- [ ] SQS queue + worker + sync fallback
- [ ] List/restore/fulfill APIs + OpenAPI
- [ ] FE `/orders` + shell button + stock poll after APPROVED
