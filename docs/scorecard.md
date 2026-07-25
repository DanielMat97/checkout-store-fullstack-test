# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-25** (smoke live FE+API; E2E cloud customer→tx→pay APPROVED→stock−1)  
> Modo: **evaluador técnico de la empresa contratante** (no autoelogio del candidato).

---

## 0. Protocolo obligatorio (siempre)

Cada vez que un agente, humano o PR revise este scorecard **debe** comportarse como el panel de contratación de la empresa. No como coach amable.

### Personas del panel (todas deben opinar)

| Rol | Pregunta que hace | Qué castiga |
|---|---|---|
| **Arquitecto de software** | ¿Los límites, datos y fallos están modelados como sistema en producción? | Carpetas “hexagonales” vacías, ADRs sin código, mock que miente sobre el dominio |
| **Líder técnico** | ¿Lo clonaría un senior y lo operaría sin vergüenza? | Cobertura cosmética, secrets en docs, deuda escondida, “casi listo” |
| **Product Owner** | ¿El journey del brief se cumple de punta a punta **con sistema real**? | UI demo sin backend; pasos 5.x del brief sin evidencia |
| **Security / compliance** | ¿PCI-minded + OWASP demostrable? | PAN/CVV persistidos, headers “existen” sin HTTPS/Observatory, keys en repo |
| **Hiring manager (barra alta)** | ¿Contrataría a este perfil **hoy** con este entregable? | Inflar puntos; dar crédito por intención |

### Reglas de calificación (supremamente difíciles)

1. **Solo evidencia ejecutable / observable.** Código, tests verdes con %, URL desplegada, OpenAPI importable, captura Observatory. Docs y TODOs **no suman**.
2. **Scaffolding = 0 o casi 0.** Health checks ≠ API. Carpetas hex ≠ Hexagonal. `mockPay` ≠ pasarela.
3. **Redondeo hacia abajo.** Ante duda, bajar 1–2 pts. Nunca “poner 8 por esfuerzo”.
4. **Criterio binario cuando el brief es binario.** Ej.: deploy cloud sin URL pública = **0**. Tests sin ≥80% FE **y** BE documentados = **0–2** máx.
5. **Mock UI no puede llenar puntos de API/pago/deploy.** Puede aportar a onboarding (parcial), imágenes, CSS, responsive.
6. **Bonus Hex/ROP:** solo si hay puertos + use-cases con tests y flujo real; estructura de carpetas sola ≤ **2/10**.
7. **Prohibido “puntos por potencial”.** La proyección va en sección aparte; el puntaje “hoy” es el único que cuenta para aprobar.
8. **Actualizar este archivo** en cada hito material (living-docs): fecha, tabla de puntaje, veredicto del panel, gaps.

### Checklist del evaluador (antes de publicar números)

- [x] Smoke FE HTTPS 200: https://master.dw2i8myh0xumx.amplifyapp.com
- [x] Smoke API: `GET /products` 200; `GET /products/:id` + `/stock` 200
- [x] E2E cloud: `POST /customers` → `POST /transactions` PENDING → `POST …/pay` **APPROVED** (`providerRef=fake_…`) → stock **8→7**; `GET /deliveries/:id` 200
- [x] Bundle FE incluye `qo9kbfxew8.execute-api.us-east-1.amazonaws.com` (no solo mock)
- [x] PAN/CVV: `cardSession` efímero; sin campos PAN en `@app/persistence`
- [x] Coverage report `docs/coverage.md` (>80% lines FE+BE)
- [x] API responses aún exponen `x-powered-by: Express` (headers OWASP no demostrados en cloud)
- [x] Observatory: API Mozilla no disponible en este corte (502)
- [x] Releí rúbrica base/bonus; apliqué 4 lentes

---

## 1. Veredicto del panel (hoy)

| Lente | Veredicto (1 línea) |
|---|---|
| Arquitecto | Dominios cloud reales + stock decrement; pasarela prod = **fake**, no sandbox del brief. |
| Líder técnico | Deploy operable; README con URLs; fuga `X-Powered-By`; OpenAPI solo en repo. |
| Product Owner | Journey API 5.1–5.3 **demostrado en cloud**; UI browser E2E no capturado. |
| Security | PCI-minded en código; HTTPS sí; headers/Observatory **no** evidenciados en URL pública. |
| Hiring bar | **Aún no (≥100 base).** Base 89; falta sandbox real + OWASP demo + README al 5. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **89 / 100** |
| **Bonus** | **32 / 50** |
| **Total** | **121 / 150** |
| **¿Aprueba (≥100 base)?** | **No** |

### Evidencia citada (cloud)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| Pay | `tx_c73f8af4-…` → `APPROVED` / `fake_approved_…` · stock Aura Quiet 8→7 |

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1–4 UI + fees | NORA Soft Amplify | FE 200; fees en env Amplify. | ✅ |
| 5.1 PENDING | `POST /transactions` live | PENDING + deliveryId. | ✅ |
| 5.2 Pago proveedor | `POST …/pay` live | **Fake** gateway (`fake_approved_…`), no sandbox UAT. | 🟡 |
| 5.3 Stock | `GET …/stock` | 8→7 tras APPROVED. | ✅ |
| 4 dominios API | products/customers/tx/deliveries | Smoke live en los cuatro. | ✅ |
| Seed | catálogo en DynamoDB | OK. | ✅ |
| Jest >80% | `docs/coverage.md` | OK (lines). | ✅ |
| Deploy | Amplify + API GW | URLs públicas. | ✅ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README | 5 | **4** | URLs prod + coverage + OpenAPI path. −1: sin Swagger/Postman público; data-model no enlazado en README. |
| 2 | Imágenes | 5 | **4** | Unsplash + DS; sin matriz overflow navegadores. |
| 3 | Onboarding pago | 20 | **17** | E2E API cloud APPROVED+stock; FE apunta a API. −3: prod en **fake** (brief pide sandbox); sin captura UI E2E. |
| 4 | API funcionando | 20 | **18** | 4 dominios + validación 400 + pay path live. −2: `X-Powered-By` en prod; OpenAPI no hosteado. |
| 5 | Tests >80% | 30 | **27** | FE/BE lines >80 documentados. −3: branches tx rebajados; sandbox fuera del collect global. |
| 6 | Deploy | 20 | **19** | FE+API HTTPS públicos y cableados. −1: Amplify default domain / sin evidencia Observatory. |
| | **Subtotal base** | **100** | **89** | |

**Base oficial del corte: 89 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP/HTTPS | 5 | **3** | HTTPS FE+API. −2: headers OWASP no visibles en respuesta API; Observatory no corrido. |
| 2 | Responsive | 5 | **2** | Mobile-first en código; sin matriz de dispositivos/browsers. |
| 3 | CSS | 10 | **6** | Design system NORA; no “CSS mastery” demo. |
| 4 | Clean code | 10 | **6** | Hex/ROP cableados; deuda headers en Lambda. |
| 5 | Hexagonal | 10 | **8** | Ports + use-cases + adapters con tests; no perfect isolation everywhere. |
| 6 | ROP | 10 | **7** | `neverthrow` en pagos/tx; no 100% superficie. |
| | **Subtotal bonus** | **50** | **32** | |

---

## 5. Total estricto

```
Base   89 / 100
Bonus  32 /  50
───────────────
Total 121 / 150
```

**Resultado hiring:** **REJECT** (base &lt; 100). Deploy ya no es el bloqueo; el umbral pide ~11 pts más de base.

### Gap mínimo a 100 base

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | Prod `PAYMENT_GATEWAY_MODE=sandbox` + keys Vault + 1 pago sandbox live | +2–3 (#3) |
| P0 | Quitar `X-Powered-By` + headers OWASP en API GW + nota Observatory | +1–2 (#4 / bonus) |
| P1 | README: link data-model + OpenAPI/Swagger público | +1 (#1) |
| P1 | Subir branches tx / incluir sandbox en coverage narrative | +1–2 (#5) |

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 89 | 32 | **121** | Reject (base) |
| + sandbox live + OWASP demo + README 5 | 98–100 | 35–37 | **133–137** | Pass posible |

---

## 7. Cómo re-evaluar (instrucción para agentes)

Cuando el usuario pida “actualizar scorecard”, “¿cómo vamos?” o cierre un task T#:

1. Leer `docs/fullstack-test.md` rúbrica + este protocolo §0.  
2. Inspeccionar código/tests/deploy **actual**, no memoria.  
3. Reescribir §§1–5 con fecha nueva.  
4. Ser **más estricto** si hay duda; citar evidencia o “no hallado”.  
5. Actualizar `docs/current-state.md` + `CHANGELOG.md`.  
6. Nunca subir `docs/fullstack-test.md` a GitHub público (secrets).

---

## 8. Anti-patrones de evaluación (prohibidos)

- “El mock cuenta como API”.  
- “Las carpetas hexagonales merecen 7/10”.  
- “Casi 80% de coverage → 25 pts”.  
- “Serverless está listo → pts de deploy”.  
- “UI muy bonita → subir onboarding a 18/20 sin pasarela”.  
- Suavizar el veredicto para no desmotivar.

El objetivo del scorecard es **proteger la barra de contratación**, no celebrar progreso parcial.
