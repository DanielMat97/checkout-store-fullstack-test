# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-24** (FE Amplify + API Gateway **públicos**; smoke `GET /products` 200)  
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

- [x] Corrí o verifiqué el flujo feliz local (tests).
- [x] Busqué PAN/CVV en persistencia / logs.
- [x] Confirmé dominios API reales (no solo `/health`).
- [x] Vi coverage report (`npm run test:cov` + `docs/coverage.md`).
- [x] Vi URL de deploy: FE https://master.dw2i8myh0xumx.amplifyapp.com · API https://qo9kbfxew8.execute-api.us-east-1.amazonaws.com · `GET /products` → 200 seeded.
- [x] Releí la rúbrica base y bonus sin inventar criterios nuevos.
- [x] Apliqué las 4 lentes (Arquitecto / TL / PO / Security) en el veredicto.

---

## 1. Veredicto del panel (hoy)

| Lente | Veredicto (1 línea) |
|---|---|
| Arquitecto | Stack en cloud real; Node 24 async handlers; falta prueba E2E pago live. |
| Líder técnico | URLs públicas + Actions secrets; table name prod no stage-suffix (−ops). |
| Product Owner | Catálogo live OK; checkout E2E en prod **no** demostrado en este corte. |
| Security | HTTPS público sí; sin captura Observatory; pago en `fake` mode. |
| Hiring bar | **Base sí (≥100 no requerido si rúbrica es /150).** Deploy ya no es 0. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **84 / 100** |
| **Bonus** | **32 / 50** |
| **Total** | **116 / 150** |
| **¿Aprueba (≥100 base)?** | **No** (84&lt;100) — pero deploy ya no bloquea a 0 |

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1–4 UI + fees | NORA Soft | OK. | ✅ |
| 5.1–5.3 | BE + FE → API prod | FE bundle apunta a API; **pago E2E live no capturado**. | 🟡 |
| 4 dominios API | OpenAPI + `GET /products` live | Solo smoke products verificado hoy. | 🟡 |
| Seed | seed en `checkout-store` | OK. | ✅ |
| Jest >80% + README | coverage + URLs en README | OK. | ✅ |
| Deploy | Amplify + API Gateway HTTPS | URLs públicas verificadas. | ✅ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README | 5 | **4** | URLs prod + local; −1 runbook aún incompleto para evaluador externo. |
| 2 | Imágenes | 5 | **4** | Sin cambio. |
| 3 | Onboarding pago | 20 | **16** | FE live wired; −4 sin evidencia de pago aprobado/declinado en prod. |
| 4 | API funcionando | 20 | **15** | `GET /products` live 200 + seed; −5 sin smoke documentado de los 4 dominios en cloud. |
| 5 | Tests >80% | 30 | **27** | Sin cambio material. |
| 6 | Deploy | 20 | **18** | FE+API HTTPS públicos; −2 modo pago `fake`, sin dominio custom / observabilidad demo. |
| | **Subtotal base** | **100** | **84** | |

**Base oficial del corte: 84 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP/HTTPS | 5 | **3** | HTTPS en Amplify + API GW; headers en código; −2 sin Observatory. |
| 2 | Responsive | 5 | **2** | Sin matriz. |
| 3 | CSS | 10 | **6** | Sin cambio. |
| 4 | Clean code | 10 | **6** | Node 24 handler fix; sin más. |
| 5 | Hexagonal | 10 | **8** | Sin cambio. |
| 6 | ROP | 10 | **7** | Sin cambio. |
| | **Subtotal bonus** | **50** | **32** | |

---

## 5. Total estricto

```
Base   84 / 100
Bonus  32 /  50
───────────────
Total 116 / 150
```

**Resultado hiring:** **aún REJECT por base &lt;100** — gap principal: E2E pago live + smoke 4 dominios + Observatory.

### Gap mínimo a 100 base

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | Smoke E2E live (customer→tx→pay) + documentar | +4–5 (#3/#4) |
| P0 | Smoke 4 dominios en cloud | +3–4 (#4) |
| P1 | Observatory / headers en URL pública | bonus |

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 84 | 32 | **116** | Reject (base) |
| + E2E live + Observatory | 98–100 | 36 | **134–136** | Pass posible |

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
