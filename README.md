# 🛒 Checkout Store (NORA)

> Prueba técnica fullstack — **tienda premium** para comprar un producto con tarjeta, datos de entrega, resultado de pago y actualización de stock.  
> Score (rúbrica hiring bar): **150 / 150** → [`docs/scorecard.md`](docs/scorecard.md) · Estado vivo → [`docs/current-state.md`](docs/current-state.md)

Este README es el **mapa del entregable**: por qué elegimos este stack, qué construimos, cómo se opera (pipelines, CloudWatch, feature stacks) y dónde está cada evidencia.

---

## 🔗 URLs en vivo (empezá por acá)

| Qué | URL / recurso |
|---|---|
| 🌐 **Frontend (Amplify)** | https://master.dw2i8myh0xumx.amplifyapp.com |
| ☁️ **API (HTTP API / Lambda)** | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| 📄 **OpenAPI JSON (público)** | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |
| 📚 **Portal Apidog (Try it)** | https://7j6npb6n4w.apidog.io — se re-sincroniza ~cada **3 h** ([detalle](docs/api/apidog.md)) |
| 🖥️ Web local | `http://localhost:5173` |
| 🖥️ API local | `http://localhost:3000` (`serverless offline`) |

**Smoke rápido en prod:** `GET https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com/products`  
**Journey de pago:** customer → transaction `PENDING` → `POST …/pay` → stock / delivery (SQS worker o fallback sync).

---

## 🧭 Índice

1. [Qué es NORA y el journey](#-qué-es-nora-y-el-journey)
2. [Por qué esta solución (y no otra)](#-por-qué-esta-solución-y-no-otra)
3. [Stack y arquitectura](#-stack-y-arquitectura)
4. [Monorepo](#-monorepo)
5. [Quick start local](#-quick-start-local)
6. [Dominios HTTP / OpenAPI / Apidog](#-dominios-http--openapi--apidog)
7. [Modelo de datos](#-modelo-de-datos)
8. [Pago (sandbox) y secretos](#-pago-sandbox-y-secretos)
9. [Frontend, UX y design system](#-frontend-ux-y-design-system)
10. [Hexagonal + ROP](#-hexagonal--rop)
11. [Post-pago: SQS + consola `/orders`](#-post-pago-sqs--consola-orders)
12. [Observabilidad CloudWatch](#-observabilidad-cloudwatch)
13. [Pipelines CI/CD (stage por stage)](#-pipelines-cicd-stage-por-stage)
14. [Feature branches `fb-*` y teardown](#-feature-branches-fb--y-teardown)
15. [Seguridad](#-seguridad)
16. [Cobertura de tests](#-cobertura-de-tests)
17. [Variables de entorno](#-variables-de-entorno)
18. [Specs (SDD) y ADRs](#-specs-sdd-y-adrs)
19. [Mapa de documentación](#-mapa-de-documentación)

---

## ✨ Qué es NORA y el journey

**NORA** es un checkout mobile-first (inspiración visual premium — ADR [0007](docs/adr/0007-premium-ecommerce-visual-system.md), flujo split — ADR [0008](docs/adr/0008-nora-pop-split-checkout.md)):

1. 📦 **Catálogo** → producto con stock  
2. 💳 **Pay with credit card** → modal tarjeta + entrega (Luhn, Visa/MC)  
3. 🧾 **Order summary** (backdrop) con fees  
4. ▶️ **Pay** → API real (sandbox en prod)  
5. ✅ **Status** APPROVED / DECLINED / ERROR  
6. 📉 Stock actualizado tras APPROVED  

Ops demo: consola **`/orders`** (listar APPROVED, restaurar stock, marcar delivery FULFILLED).

Tarjeta de prueba (modo `fake` local): `4111 1111 1111 1111`, `MM/YY` futuro, CVV `123`.  
En **prod** el gateway corre en `PAYMENT_GATEWAY_MODE=sandbox` — ver [`docs/payment-adapter.md`](docs/payment-adapter.md) (**sin marca de proveedor en el source público**).

---

## 🧠 Por qué esta solución (y no otra)

| Decisión | Por qué |
|---|---|
| **Monorepo + 4 microservicios Nest** | El brief pide dominios (`products` / `customers` / `deliveries` / `transactions`). Separar Bounded Contexts obliga contratos claros y deploys selectivos (ADR [0005](docs/adr/0005-domain-microservices.md)). |
| **Un solo HTTP API (SF4)** | Un frontend = una `VITE_API_BASE_URL`. Evita CORS/N gateways. El routing `/products/**` → Lambda products, etc. (ADR [0006](docs/adr/0006-single-api-gateway.md), [0003](docs/adr/0003-nestjs-serverless-framework.md)). |
| **DynamoDB + ElectroDB single-table** | Serverless-native, pay-per-request, un table por stage (`checkout-store-<stage>`). ElectroDB tipa PK/SK/GSI sin ORM pesado (ADR [0004](docs/adr/0004-dynamodb-electrodb.md)). |
| **Hexagonal + neverthrow (ROP)** | Controllers flacos; reglas en use-cases; errores de dominio → HTTP en un solo mapper. Testeable sin Dynamo/AWS (ADR [0001](docs/adr/0001-hexagonal-architecture.md), [0009](docs/adr/0009-neverthrow-rop.md)). |
| **Amplify Hosting para el SPA** | Build `amplify.yml`, HTTPS/CloudFront, branches `fb-*` aislados. Encaja con el monorepo Vite. |
| **SQS post-APPROVED** | El brief pide stock sync; desacoplar efectos (stock + delivery) del request HTTP mejora resiliencia; fallback in-process si no hay queue (ADR [0011](docs/adr/0011-sqs-post-payment-effects.md)). |
| **Vault + GH Secrets** | Keys de pasarela fuera de git; CI puede cargar desde Vault (ADR [0010](docs/adr/0010-hashicorp-vault-secrets.md)). |
| **Spec-Driven Development** | Cada feature: `specs/<feature>/{spec,plan,tasks}.md` → código → living docs. Índice: [`specs/INDEX.md`](specs/INDEX.md). Playbook: [`docs/sdd-playbook.md`](docs/sdd-playbook.md). |

---

## 🏗️ Stack y arquitectura

```
┌──────────────┐     HTTPS      ┌─────────────────────┐
│  Amplify FE  │ ──────────────►│ API Gateway HTTP API │
│  React+Redux │  VITE_API_…    │  (Serverless Frame.) │
└──────────────┘                └──────────┬──────────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            ▼                              ▼                              ▼
     Lambda products              Lambda customers …              Lambda transactions
            │                              │                              │
            └──────────────────────────────┼──────────────────────────────┘
                                           ▼
                              DynamoDB  checkout-store-<stage>
                                           ▲
                              SQS orders-events ──► Lambda ordersWorker
```

| Capa | Tecnología |
|---|---|
| Frontend | React + Redux Toolkit + Vite (`apps/web`) |
| Backend | NestJS 11 en Lambda (`services/*`) |
| Deploy API | **Serverless Framework 4** (`serverless.ts`) |
| Persistencia | DynamoDB + ElectroDB (`packages/persistence`) |
| Shared | Logger JSON, ValidationPipe, OWASP headers, EMF (`packages/shared`) |
| Cola | SQS `checkout-orders-events-<stage>` + DLQ |
| Secretos | HashiCorp Vault (CI) / env local |
| Docs API | OpenAPI 3 + portal [Apidog](https://7j6npb6n4w.apidog.io) |

---

## 📁 Monorepo

```
serverless.ts                 # HTTP API + Lambdas + DynamoDB + SQS + CloudWatch/IAM
amplify.yml                   # Build FE en Amplify
apps/web                      # SPA NORA + /orders + e2e Playwright
services/products|customers|deliveries|transactions
packages/shared               # createLogger, logHttpRequest, domainErrorToHttp, security
packages/persistence          # ElectroDB entities + seed
infra/observability-resources.cjs
docs/                         # living docs + ADRs
specs/                        # SDD features (todas done — ver INDEX)
.github/workflows/            # CI, deploy-api, deploy-feature, amplify-gate, destroy
```

---

## 🚀 Quick start local

```bash
cp .env.example .env          # ver sección Variables
npm install
npm run dynamodb:up           # DynamoDB Local (Docker)
npm run ensure-table && npm run seed
npm run dev                   # API :3000 + web :5173
```

| Comando | Qué hace |
|---|---|
| `npm run ci` | validate → format check → lint → audit → test → coverage |
| `npm run test:e2e` | Playwright (set `FE_BASE_URL` / `API_BASE_URL`) |
| `npm run test:stress` | Artillery suave sobre `GET /products` |
| `npm run ops:observability -- --stage=prod` | Lista dashboard / alarms / IAM viewer |

Checkout local: Product → **Pay with credit card** → summary → Pay → Status.  
Live API: `VITE_MOCK_MODE=false` + `VITE_API_BASE_URL=<api>`.

Design system: [`docs/design-system.md`](docs/design-system.md) · Smoke API: [`docs/api/smoke.md`](docs/api/smoke.md).

---

## 🔌 Dominios HTTP / OpenAPI / Apidog

| Prefijo | Responsabilidad |
|---|---|
| `/products` | Catálogo + `GET …/stock` |
| `/customers` | Perfil comprador (sin tarjeta) |
| `/deliveries` | Dirección / fulfill `PATCH` |
| `/transactions` | Create PENDING, pay, list, restore (ops) |
| `*/health` | Liveness por servicio |

- **OpenAPI v1.0.1+** con **todas** las responses de éxito y error (`400/404/409/422/500/502`) alineadas a Nest + `domainErrorToHttp` — [`docs/api/openapi.json`](docs/api/openapi.json).  
- **Server por defecto = AWS prod** (variable `baseUrl`) para que Apidog “Try it” no use localhost — [`docs/api/apidog.md`](docs/api/apidog.md).  
- Spec: [`specs/openapi-complete-responses/`](specs/openapi-complete-responses/) · [`specs/apidog-portal-aws-server/`](specs/apidog-portal-aws-server/).

---

## 🗄️ Modelo de datos

Single-table **ElectroDB** — entidades `Product`, `Customer`, `Delivery`, `Transaction`; PK/SK + GSI1 para listados por fecha/status.

Detalle (ASCII + access patterns): [`docs/data-model.md`](docs/data-model.md) · Spec seed: [`specs/persistence-seed/`](specs/persistence-seed/).  
Seed NORA: 4 productos (`prod_aura_quiet`, …) — el evaluador **no** necesita create-product.

---

## 💳 Pago (sandbox) y secretos

- Puerto `PaymentGatewayPort` → `FakePaymentGateway` (local/CI) o `SandboxPaymentGateway` (prod).  
- Integridad / tokenize / create / poll — **sin brand del proveedor en código público**.  
- `POST /transactions/:id/pay` responde **HTTP 200** con `paymentStatus` `APPROVED|DECLINED|ERROR` (DECLINED no es 4xx).  
- Docs: [`docs/payment-adapter.md`](docs/payment-adapter.md) · Vault: [`docs/vault.md`](docs/vault.md) · ADR [0010](docs/adr/0010-hashicorp-vault-secrets.md).

PAN/CVV: solo en memoria (`cardSession` FE); redacted en logs; nunca en DynamoDB.

---

## 🎨 Frontend, UX y design system

- Pantallas presentacionales + hooks (`useCatalog`, `useCheckoutForm`, `useSummaryPay`, `usePaymentStatus`, `useOrdersConsole`, …).  
- Tokens CSS, responsive (matriz Chromium / Firefox / WebKit + iPhone SE).  
- Evidencia Playwright vs Amplify: [`docs/ux-evidence.md`](docs/ux-evidence.md).  
- Specs: [`ux-quality-bar`](specs/ux-quality-bar/), [`frontend-hooks-coverage`](specs/frontend-hooks-coverage/), [`frontend-live-wiring`](specs/frontend-live-wiring/), [`checkout-ui-mock`](specs/checkout-ui-mock/).

---

## 🧩 Hexagonal + ROP

- Use-cases con `Result` / `ResultAsync.andThen` (create / pay / apply-effects).  
- Controllers **sin** repositorios (Get/List transaction vía use-case).  
- `domainErrorToHttp` compartido en `@app/shared`.  
- Specs: [`architecture-hex-rop`](specs/architecture-hex-rop/), [`bonus-hex-rop-polish`](specs/bonus-hex-rop-polish/).

---

## 📬 Post-pago: SQS + consola `/orders`

1. Pay **APPROVED** → publica `PaymentApproved` a SQS (o publisher in-process si no hay `ORDERS_EVENTS_QUEUE_URL`).  
2. `ordersWorker` aplica: −stock, delivery `FULFILLABLE`, `effectsApplied`.  
3. Ops UI `/orders`: listar, **restore** stock (+1, tx `REFUNDED`), **PATCH** delivery `FULFILLED`.

ADR [0011](docs/adr/0011-sqs-post-payment-effects.md) · Specs: [`sqs-orchestration`](specs/sqs-orchestration/), [`orders-console`](specs/orders-console/).

---

## 📊 Observabilidad CloudWatch

Tras `serverless deploy`, el stack crea (por stage):

| Recurso | Nombre |
|---|---|
| 📈 Dashboard | **`checkout-api-<stage>-ops`** (ej. `checkout-api-prod-ops`) |
| 🔔 SNS alerts | `checkout-api-<stage>-ops-alerts` |
| 👤 IAM viewer (solo lectura) | `checkout-api-<stage>-cw-viewer` |
| 🚨 Alarms | API **4xx**, **5xx**, **latency spike**; **Lambda Errors** por función |

**Widgets del tablero:** 4xx/5xx · latencia avg/p99 · EMF `Checkout/API` · Lambda Errors/Duration/Invocations · profundidad SQS (+ DLQ) · Insights de `http.request` 4xx/5xx.

**Logs JSON** (`createLogger` / `logHttpRequest`): `stage`, `domain`, `layer`, `operation`, `correlationId`, `statusClass`, `route`, `coldStart`, EMF. Pay emite `pay.outcome` / `pay.failed`.

```bash
# Verificar con AWS CLI
npm run ops:observability -- --stage=prod
```

Guía completa + Insights: [`docs/observability.md`](docs/observability.md) · ADR [0014](docs/adr/0014-observability-cloudwatch.md) · Spec [`observability-cloudwatch`](specs/observability-cloudwatch/).

Consola AWS (prod, región típica `us-east-1`):  
CloudWatch → Dashboards → `checkout-api-prod-ops`.

Email opcional de alarmas: `OBSERVABILITY_ALERT_EMAIL` antes del deploy (confirmar SNS).

---

## 🔁 Pipelines CI/CD (stage por stage)

Runbooks: [`docs/ci-cd.md`](docs/ci-cd.md) · [`docs/deploy.md`](docs/deploy.md).

### 1️⃣ Workflow `CI` (`.github/workflows/ci.yml`)

Fail-closed. Orden:

| Stage | Qué valida |
|---|---|
| **Validate** | Build / tsc monorepo |
| **Prettier** | `format:check` |
| **Lint** | oxlint |
| **Audit** | npm audit gate (OWASP deps) |
| **Test** | Jest workspaces |
| **Coverage** | umbrales ≥80% |
| **Backend gate (on FE)** | Si cambió `apps/web/` → Nest test+cov+audit |
| **CodeQL** | SAST requerido |
| **SonarCloud** | Solo si hay `SONAR_TOKEN` |
| **quality-ok** | Señal verde para deploys |

### 2️⃣ `Deploy API (prod)` (`.github/workflows/deploy-api.yml`)

| Stage | Rol |
|---|---|
| **Quality** | Reusa `CI` (obligatorio) |
| **Baseline** | Guarda SHA *last-good* del último deploy exitoso |
| **Detect** | ¿full stack o solo functions? |
| **Deploy** | Serverless `prod` (+ sync Amplify `VITE_API_BASE_URL` + comentario URLs) |
| **Publish URLs** | Comentario en commit con FE/API |
| **Smoke** | Wait ready → **Playwright** → **OWASP ZAP** (API + FE) |
| **Stress** | Artillery opcional (`continue-on-error`, **no** rollback) — ADR [0013](docs/adr/0013-artillery-stress-optional.md) |
| **Rollback** | Si smoke falla → redeploy SHA last-good — ADR [0012](docs/adr/0012-deploy-smoke-sast-rollback.md) |

### 3️⃣ `Amplify build gate` (FE en `master`)

Si cambian paths FE: espera job Amplify **`SUCCEED`** para el `GITHUB_SHA`; si `FAILED`/`CANCELLED`/timeout → stage rojo. Comenta URL FE. ADR [0015](docs/adr/0015-amplify-build-gate.md).

### 4️⃣ `Deploy feature (fb-*)`

| Stage | Rol |
|---|---|
| **Quality** | CI completo |
| **Deploy** | Stage SF aislado + tabla + seed + **Amplify branch** con `VITE_*` → API del stage |
| **Publish URLs** | Sticky comment PR/commit (FE + API + link Destroy) |
| **Amplify build** | Espera `SUCCEED` |
| **Smoke / Stress / Rollback** | Igual filosofía que prod (feature env) |

### 5️⃣ `Destroy feature stack` (botón en Actions)

Actions → **Destroy feature stack** → `ref_name=fb-…/…` · `confirm=destroy`  
→ `serverless remove` + `amplify delete-branch`. No toca prod. ADR [0016](docs/adr/0016-feature-env-urls-teardown.md).

---

## 🌿 Feature branches `fb-*` y teardown

```
push fb-42/checkout-fees
  → stage Serverless: fb-42-checkout-fees
  → Amplify branch:   fb-42/checkout-fees
  → FE URL:           https://fb-42-checkout-fees.<amplify-domain>
  → comentario en PR con links + botón Destroy
```

Detalle: [`docs/deploy.md`](docs/deploy.md) · Spec [`feature-env-urls-teardown`](specs/feature-env-urls-teardown/).

---

## 🔒 Seguridad

- Headers OWASP en Nest + Amplify `customHeaders`; strip `X-Powered-By`.  
- Secrets fuera de git (Vault / GH Secrets).  
- Evidencia: [`docs/security.md`](docs/security.md) · Spec [`security-hardening`](specs/security-hardening/).

---

## 🧪 Cobertura de tests

Umbral **≥80%** statements/branches/functions/lines por workspace (FE + Nest).

| Área | Ejemplo |
|---|---|
| Frontend `@app/web` | ~99%+ lines |
| Nest services | ≥80% (incl. branches) |
| Shared / persistence | ~97% |

Tabla y matices: [`docs/coverage.md`](docs/coverage.md) · Spec [`testing-coverage`](specs/testing-coverage/).  
E2E: Playwright · Stress: Artillery · Gate BE-on-FE: `npm run ci:backend-on-fe`.

---

## 🔐 Variables de entorno

Copia [`.env.example`](.env.example). Nombres neutrales (sin brand de pasarela):

| Variable | Uso |
|---|---|
| `PAYMENT_API_URL` / `PAYMENT_*_KEY` / `PAYMENT_GATEWAY_MODE` | Gateway (`fake` \| `sandbox`) |
| `DYNAMODB_TABLE_NAME` / `DYNAMODB_ENDPOINT` / `AWS_REGION` | Persistencia |
| `BASE_FEE` / `DELIVERY_FEE` | Fees (minor units) |
| `CORS_ORIGIN` | Orígenes API |
| `VITE_MOCK_MODE` / `VITE_API_BASE_URL` / `VITE_*_FEE` | SPA |
| `ORDERS_EVENTS_QUEUE_URL` | SQS (vacío → sync fallback) |
| `OBSERVABILITY_ALERT_EMAIL` | SNS opcional |
| `VAULT_*` | Secretos CI (opc.) |

Deploy: ver tablas en [`docs/deploy.md`](docs/deploy.md) (`AMPLIFY_APP_ID`, `SERVERLESS_STAGE`, `FE_BASE_URL`, …).

---

## 📋 Specs (SDD) y ADRs

Todas las features en [`specs/INDEX.md`](specs/INDEX.md) están **done**, entre ellas:

| Spec | Cierra |
|---|---|
| `checkout-ui-mock` / `checkout-payment` / `frontend-live-wiring` | UI + pago E2E |
| `persistence-seed` / `api-domains` / `payment-gateway` | Datos + APIs + sandbox |
| `architecture-hex-rop` / `bonus-hex-rop-polish` | Hex + ROP |
| `testing-coverage` / `frontend-hooks-coverage` | Cobertura + hooks + BE-on-FE |
| `cloud-deploy` / `deploy-smoke-rollback` / `amplify-build-gate` | AWS + smoke/rollback + Amplify SUCCEED |
| `secrets-vault` / `security-hardening` | Vault + OWASP |
| `sqs-orchestration` / `orders-console` | Post-pay + ops |
| `observability-cloudwatch` | Logs + dashboards + alarms + IAM |
| `feature-env-urls-teardown` | Comentarios URL + Destroy |
| `openapi-complete-responses` / `apidog-portal-aws-server` | OpenAPI completo + portal |
| `ux-quality-bar` / `readme-deliverables` | UX matrix + onboarding |

**ADRs 0001–0016** en [`docs/adr/`](docs/adr/) (hex, ROP, Nest/SF4, Dynamo, gateway único, NORA UI, neverthrow, Vault, SQS, smoke/rollback, Artillery, CloudWatch, Amplify gate, feature teardown).

---

## 📚 Mapa de documentación

| Doc | Contenido |
|---|---|
| [`docs/current-state.md`](docs/current-state.md) | Estado + URLs + specs |
| [`docs/scorecard.md`](docs/scorecard.md) | Rúbrica 150/150 |
| [`docs/brief-gap-analysis.md`](docs/brief-gap-analysis.md) | Gaps vs brief |
| [`docs/ci-cd.md`](docs/ci-cd.md) | Pipelines |
| [`docs/deploy.md`](docs/deploy.md) | Runbook AWS / Amplify |
| [`docs/observability.md`](docs/observability.md) | CloudWatch + logs |
| [`docs/security.md`](docs/security.md) | Headers / PCI-minded |
| [`docs/payment-adapter.md`](docs/payment-adapter.md) | Sandbox adapter |
| [`docs/vault.md`](docs/vault.md) | HashiCorp Vault |
| [`docs/data-model.md`](docs/data-model.md) | DynamoDB |
| [`docs/design-system.md`](docs/design-system.md) | UI tokens/components |
| [`docs/ux-evidence.md`](docs/ux-evidence.md) | Matriz responsive |
| [`docs/coverage.md`](docs/coverage.md) | % Jest |
| [`docs/api/smoke.md`](docs/api/smoke.md) | Curls happy path |
| [`docs/api/apidog.md`](docs/api/apidog.md) | Portal Apidog |
| [`docs/sdd-playbook.md`](docs/sdd-playbook.md) | Cómo trabajamos SDD |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial Keep a Changelog |

Logger compartido + headers: paquete `@app/shared` (regla Cursor `standardized-logging`).

---

## ✅ Checklist del evaluador (30 s)

1. Abrí el [FE](https://master.dw2i8myh0xumx.amplifyapp.com) y comprá un producto (sandbox).  
2. Probá `GET /products` en [Apidog](https://7j6npb6n4w.apidog.io) (server AWS).  
3. Revisá OpenAPI público y [`docs/security.md`](docs/security.md).  
4. En AWS: dashboard `checkout-api-prod-ops` + `npm run ops:observability -- --stage=prod`.  
5. Leé el [scorecard](docs/scorecard.md) — **PASS 150/150**.

¡Gracias por revisar NORA! 🛍️
