# Plan de corrección — `DanielMat97/checkout-store-fullstack-test`

> Basado en auditoría real: clon del repo, `npm install`, y `npx jest --coverage` corrido de forma independiente en cada workspace (no solo lectura del README). Fecha de auditoría: 24/Jul/2026.  
> **Aplicado 24/Jul/2026** (se ignora a propósito el ítem de “todo en un día / PRs” — no se reescribe el historial de commits).

---

## 🔴 Crítico — resolver antes de entregar

### 1. El nombre del repositorio viola una instrucción explícita de la prueba

- [x] Renombrar el repositorio en GitHub → **`checkout-store-fullstack-test`**
- [x] Actualizar el remote local → `git@github.com:DanielMat97/checkout-store-fullstack-test.git`
- [x] Limpiar menciones restantes del nombre viejo del repo:
  - [x] `docs/deploy.md`
  - [x] `docs/api/apidog.md`
  - [x] `specs/apidog-portal-aws-server/spec.md`
- [x] Subdominio Apidog (`7j6npb6n4w.apidog.io`) **no** contiene la marca; si el *display name* del proyecto en la UI de Apidog aún dice el nombre viejo, renombrarlo manualmente ahí (fuera del repo).
- [x] Amplify / Serverless IDs opacos — sin marca en el nombre.

---

## 🟡 Importante — decidir cómo abordarlo

### 2. Historial de commits: todo en un solo día, sin ramas/PRs

**Omitido a pedido** — no se reescribe historial ni se inventan PRs retroactivos.

### 3. Verificar tú mismo que el deploy en vivo funciona

- [x] FE `https://master.dw2i8myh0xumx.amplifyapp.com` → **HTTP 200**
- [x] API `GET /products` → **HTTP 200** con catálogo seed
- [x] Bundle Amplify con `VITE_MOCK_MODE:"false"` y `VITE_API_BASE_URL` apuntando al HttpApi (`qo9kbfxew8…`)

### 4. El README reporta una cobertura de frontend distinta a la real

- [x] `docs/coverage.md` alineado al snapshot real post-correcciones (sin cifra inventada 99.65% en README). README apunta a `docs/coverage.md`.

---

## 🟢 Recomendado — huecos de cobertura puntuales a reforzar

**Backend — `services/transactions`**

- [x] `restore-transaction-stock.use-case.ts` — defaults de `mapPersistence`
- [x] `result-async.ts` — defaults INSUFFICIENT_STOCK + `fromRepoResult`
- [x] `pay-transaction.use-case.ts` — rama `charge.isErr`
- [x] `list-transactions.use-case.ts` — mensaje cuando el error no es `PERSISTENCE_ERROR`

**Frontend — `apps/web`**

- [x] `useCheckoutForm.ts` — load cancelado / missing product / submit válido + clear errors
- [x] `useSummaryPay.ts` — redirects, stocks map, mock card fallback, Error genérico, unmount race
- [x] `ordersApi.ts` — mock mode, fallbacks, restore/fulfill wrappers
- [x] `colombia.ts` — ramas de phone / filterSuggestions

---

## ✅ No tocar — esto ya cumple y está bien hecho

- Separación hexagonal `domain / application / ports / adapters` en los 4 servicios
- ROP real con `neverthrow` en los use cases (no cosmético)
- Firma de integridad del adaptador sandbox implementada según la documentación oficial del proveedor
- Nunca se persiste PAN/CVV (solo `last4` + marca) — ni en DB ni en Redux/localStorage
- Llaves de pago leídas por variables de entorno, cero secretos hardcodeados (verificado con grep)
- Headers OWASP reales (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Backdrop real en `SummaryPage` con Product + Base fee + Delivery + Total
- Detección Visa/Mastercard + validación Luhn correctamente implementadas
- Validación de stock antes de crear transacción; idempotencia explícita (`effectsApplied`) antes de descontar stock
- Controllers HTTP delgados — solo delegan a use cases
- `.gitignore` correcto (excluye `.env`, `.env.*`, y el brief original)
- CI real: build, prettier, lint, `npm audit`, tests, coverage gate >80%, CodeQL, SonarCloud opcional, ZAP, Playwright

---

## 📋 Pendiente de auditar (siguiente ronda, si quieres que continúe)

- [ ] README completo línea por línea contra los 5 pts de la rúbrica
- [ ] `docs/scorecard.md` (autoevaluación del candidato) contrastado con criterio externo
- [ ] Responsive real / mobile-first (breakpoints, viewport iPhone SE)
- [ ] ADRs (`docs/adr/`) — coherencia entre lo decidido y lo implementado
- [ ] Tests E2E (Playwright) — qué cubren realmente
- [ ] `docs/data-model.md` contra el diseño real en ElectroDB/DynamoDB
