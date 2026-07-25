# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-24** (post cloud-deploy automation; **sin URL pública aún**)  
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

- [x] Corrí o verifiqué el flujo feliz local (tests; smoke live API no re-ejecutado en este corte).
- [x] Busqué PAN/CVV en persistencia / logs.
- [x] Confirmé dominios API reales (no solo `/health`).
- [x] Vi coverage report (`npm run test:cov` + `docs/coverage.md`).
- [ ] Vi URL de deploy o dije que no existe. → **no existe**.
- [x] Releí la rúbrica base y bonus sin inventar criterios nuevos.
- [x] Apliqué las 4 lentes (Arquitecto / TL / PO / Security) en el veredicto.

---

## 1. Veredicto del panel (hoy)

| Lente | Veredicto (1 línea) |
|---|---|
| Arquitecto | Pipeline deploy listo; evidencia runtime pública aún ausente. |
| Líder técnico | CI gates + selective/FB deploy; #6 sigue 0 sin URL. |
| Product Owner | Journey cableable; deploy no verificado en internet. |
| Security | PAN solo memoria; secretos de pago vía Vault (ADR 0010). |
| Hiring bar | **Aún no.** Coverage sí; cloud URL no. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **60 / 100** |
| **Bonus** | **31 / 50** |
| **Total** | **91 / 150** |
| **¿Aprueba (≥100 base)?** | **No** |

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1–4 UI + fees | NORA Soft | OK. | ✅ |
| 5.1–5.3 | BE + FE live path | Código listo; smoke live no ejecutado aquí. | 🟡 |
| 4 dominios API | OpenAPI + DTOs | OK. | ✅ |
| Seed | seed script | OK. | ✅ |
| Jest >80% + README | `test:cov` + `docs/coverage.md` + README | Cumple métrica lines; −por exclusiones/branches tx. | ✅ |
| Deploy | Pipeline listo; **sin URL pública** | **Fallo duro (#6=0).** | ❌ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README | 5 | **2** | Coverage section added; still incomplete deliverable (URLs/runbook). |
| 2 | Imágenes | 5 | **4** | Sin cambio. |
| 3 | Onboarding pago | 20 | **15** | Live wiring en código. −5: default mock + sin evidencia E2E live. |
| 4 | API funcionando | 20 | **12** | Sin cambio material. |
| 5 | Tests >80% | 30 | **27** | FE/BE lines >80, `npm run test:cov` verde, cifras publicadas. −3: branches tx 45% threshold; sandbox gateway fuera del collectCoverageFrom global. |
| 6 | Deploy | 20 | **0** | Actions+Amplify en repo; panel exige URL pública verificable → 0. |
| | **Subtotal base** | **100** | **60** | |

**Base oficial del corte: 60 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP/HTTPS | 5 | **2** | Headers + Vault secrecy design (ADR 0010); sin HTTPS público / Observatory. |
| 2 | Responsive | 5 | **2** | Sin matriz. |
| 3 | CSS | 10 | **6** | Sin cambio. |
| 4 | Clean code | 10 | **6** | Suites FE/BE más serias; publicEnv testable. |
| 5 | Hexagonal | 10 | **8** | Sin cambio. |
| 6 | ROP | 10 | **7** | Sin cambio. |
| | **Subtotal bonus** | **50** | **31** | |

---

## 5. Total estricto

```
Base   60 / 100
Bonus  31 /  50
───────────────
Total  91 / 150
```

**Resultado hiring:** **REJECT** (falta deploy + README entregable + smoke live).

### Gap mínimo a 100

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | Deploy + README URLs | +20 +3 |
| P0 | Smoke live documentado / demo off mock | +3–5 (#3/#4) |

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 60 | 31 | **91** | Reject |
| + deploy + README | 95–100 | 36 | **131–136** | Pass posible |

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
