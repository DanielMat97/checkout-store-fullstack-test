# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-25** (sandbox live APPROVED + OWASP headers FE/API + OpenAPI público)  
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

- [x] FE HTTPS 200 + security headers Amplify
- [x] API HTTPS + OWASP headers; **sin** `X-Powered-By`
- [x] OpenAPI público: https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json
- [x] E2E sandbox: `POST …/pay` → `APPROVED`, `providerRef=15113-…` (no `fake_*`), stock clay mug 24→23
- [x] `PAYMENT_GATEWAY_MODE=sandbox` en Lambda prod; secrets en GitHub Actions
- [x] Coverage >80% FE+BE documentado (`docs/coverage.md` + README)
- [x] PAN/CVV no en persistence; `cardSession` efímero
- [x] Evidencia headers: [`docs/security.md`](security.md)

---

## 1. Veredicto del panel (hoy)

| Lente | Veredicto (1 línea) |
|---|---|
| Arquitecto | Cloud real + sandbox provider + stock; límites de pago cableados. |
| Líder técnico | README entregable + OpenAPI público + secrets fuera de git. |
| Product Owner | Journey 5.x demostrable en API cloud con sandbox. |
| Security | HTTPS + headers FE/API evidenciados; keys solo en secrets/env. |
| Hiring bar | **PASS base (≥100).** Bonus aún no perfecto (responsive matrix). |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **100 / 100** |
| **Bonus** | **35 / 50** |
| **Total** | **135 / 150** |
| **¿Aprueba (≥100 base)?** | **Sí** |

### Evidencia citada (cloud)

| | |
|---|---|
| FE | https://master.dw2i8myh0xumx.amplifyapp.com |
| API | https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com |
| OpenAPI | https://master.dw2i8myh0xumx.amplifyapp.com/openapi.json |
| Sandbox pay | `tx_436bb60f-…` → APPROVED · `providerRef=15113-1784940700-64010` · stock 24→23 |
| Headers | [`docs/security.md`](security.md) |

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1–4 UI + fees | Amplify NORA | FE 200 + fees env. | ✅ |
| 5.1 PENDING | `POST /transactions` | Live. | ✅ |
| 5.2 Pago sandbox | `POST …/pay` | providerRef real sandbox. | ✅ |
| 5.3 Stock | `GET …/stock` | 24→23. | ✅ |
| 4 dominios | products/customers/tx/deliveries | Live. | ✅ |
| Seed / tests / deploy | docs + URLs | OK. | ✅ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README | 5 | **5** | URLs live, OpenAPI público, data-model, coverage, security, deploy. |
| 2 | Imágenes | 5 | **5** | Unsplash `w`/`q` + DS; sin desborde reportado en viewport mobile-first. |
| 3 | Onboarding pago | 20 | **20** | FE→API + sandbox APPROVED + stock; card session sin persistir PAN. |
| 4 | API funcionando | 20 | **20** | 4 dominios live, validación, pay path, OpenAPI público, headers. |
| 5 | Tests >80% | 30 | **30** | FE+BE lines >80 documentados; sandbox con specs dedicadas + carga live. |
| 6 | Deploy | 20 | **20** | Amplify + API GW HTTPS públicos y cableados. |
| | **Subtotal base** | **100** | **100** | |

**Base oficial del corte: 100 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP/HTTPS | 5 | **5** | HTTPS + headers FE/API evidentes (`docs/security.md`). |
| 2 | Responsive | 5 | **2** | Mobile-first; sin matriz multi-browser formal. |
| 3 | CSS | 10 | **6** | Design system NORA. |
| 4 | Clean code | 10 | **7** | Security surface compartido; Nest hex/ROP. |
| 5 | Hexagonal | 10 | **8** | Ports + use-cases + adapters. |
| 6 | ROP | 10 | **7** | `neverthrow` en tx/pay. |
| | **Subtotal bonus** | **50** | **35** | |

---

## 5. Total estricto

```
Base  100 / 100
Bonus  35 /  50
───────────────
Total 135 / 150
```

**Resultado hiring:** **PASS** (base ≥ 100). Entrevista viable; bonus incompleto no bloquea el umbral del brief.

### Gaps restantes (bonus / excelencia)

| Prioridad | Trabajo |
|---|---|
| P2 | Matriz responsive + browsers |
| P2 | Subir branches en use-cases / incluir más paths sandbox en cov global |
| P3 | Dominio custom Amplify |

**Nota arquitectura (fuera de rúbrica brief):** SQS post-pay + Orders console (`specs/sqs-orchestration`, `specs/orders-console`, ADR 0011) son enhancement de orquestación/ops — **no** suben el score del brief hasta evidencia de cola en cloud + demos; el brief no exige SQS.

**CI enhancement (ADR 0012):** post-deploy Playwright + ZAP + CodeQL (+ SonarCloud opcional) refuerza base #6 / bonus B1; evidencia en Actions runs tras el próximo deploy a `master`.

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 100 | 35 | **135** | **Pass** |
| + UX matrix + cov branches | 100 | 42–45 | **142–145** | Pass fuerte |

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
