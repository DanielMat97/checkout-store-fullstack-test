# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-24** (post `persistence-seed`)  
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

- [ ] Corrí o verifiqué el flujo feliz local.
- [ ] Busqué PAN/CVV en persistencia / logs.
- [ ] Confirmé dominios API reales (no solo `/health`).
- [ ] Vi coverage report o dije explícitamente que no existe.
- [ ] Vi URL de deploy o dije que no existe.
- [ ] Releí la rúbrica base y bonus sin inventar criterios nuevos.
- [ ] Apliqué las 4 lentes (Arquitecto / TL / PO / Security) en el veredicto.

---

## 1. Veredicto del panel (hoy)

| Lente | Veredicto (1 línea) |
|---|---|
| Arquitecto | Persistencia ElectroDB real + ports; **dominio de pago / use-cases aún ausentes**. |
| Líder técnico | Seed + tabla listos; **sigue sin definition of done** (API/tests/deploy). |
| Product Owner | Journey visual OK; **5.1–5.3 del brief siguen rotos**. |
| Security | Headers + no PAN en seed; **sin HTTPS público**. |
| Hiring bar | **No contrataría aún.** Un paso de infraestructura; no es full-stack cerrado. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **18 / 100** |
| **Bonus** | **15 / 50** |
| **Total** | **33 / 150** |
| **¿Aprueba (≥100 base)?** | **No** |

> Nota: evaluaciones previas más generosas (~47) se **rechazan** bajo este protocolo. El panel no premia storytelling.

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1. UI producto + stock + precio + descripción | Catálogo + detalle | Cumple y excede (catálogo). OK. | ✅ |
| 2. CTA exacto + modal tarjeta | Sí | OK. | ✅ |
| 3. Validación tarjeta + VISA/MC | Luhn/expiry/CVV + logos | OK a nivel FE. | ✅ |
| 3b. Delivery | Campos presentes | OK. | ✅ |
| 4. Backdrop fees (base + delivery) | FeeList | OK. | ✅ |
| 5.1 Tx `PENDING` en **backend propio** | Redux only | **Fallo duro.** | ❌ |
| 5.2 Llamada pasarela sandbox | `mockPay` | **Fallo duro.** Simulación ≠ integración. | ❌ |
| 5.3 Update tx + delivery + stock BE | Stock mock local | **Fallo duro.** | ❌ |
| 6. Status + producto con stock | Mock | Aceptable solo como demo UI. | 🟡 |
| Persistencia segura progreso | redux-persist sin PAN | Bien; falta prueba de amenaza. | 🟡 |
| 4 dominios API | Health stubs | **No cuenta como API del negocio.** | ❌ |
| Seed DB ≥ productos | `npm run seed` + ElectroDB | **Cumple seed**; aún no expuesto por API. | ✅ |
| Jest >80% FE+BE + README | No | **Fallo duro.** | ❌ |
| Deploy cloud | No | **Fallo duro.** | ❌ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README completado | 5 | **1** | Hay README, pero **no** es entregable de prueba: sin coverage, sin modelo datos serio, sin URLs cloud, OpenAPI stub. Un TL lo marcaría incompleto. |
| 2 | Imágenes / sin desborde | 5 | **4** | Bien en mock (aspect-ratio, lazy, hero). −1: dependencia Unsplash remota, sin budget/perf medido, sin evidencia Lighthouse. |
| 3 | Onboarding pago completo | 20 | **10** | Mitad del valor es el **sistema**. UI + validación + fees + status mock = demo. Sin PENDING real ni pasarela = **máximo 50%** del criterio. |
| 4 | API funcionando | 20 | **2** | Seed + tabla + repos DI. Sigue sin endpoints de negocio. +1 vs corte anterior por evidencia Dynamo real; **no** es “API funcionando”. |
| 5 | Unit tests >80% FE y BE | 30 | **0** | Umbral explícito. Smoke tests no califican. Sin reporte → **0**. |
| 6 | Deploy cloud | 20 | **0** | Sin URL pública conectada = 0. IaC en repo no despliega sola. |
| | **Subtotal base** | **100** | **18** | Suma dura ~17; se mantiene techo previo **18** (+ margen SF4 local). |

**Base oficial del corte: 18 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP + HTTPS + headers | 5 | **1** | Headers en código. Sin HTTPS público / Observatory / threat model = cosmético. |
| 2 | Responsive multi-browser | 5 | **2** | Mobile-first visible. Sin matriz browsers, sin evidencia iPhone SE real device / Safari+Firefox. |
| 3 | Habilidades CSS | 10 | **6** | Design system + motion + storefront: sólido. −4: no design tokens auditados, Unsplash, mock banner, falta polish de estados vacíos/error de red. |
| 4 | Código limpio | 10 | **3** | FE ordenado; BE empieza (persistence package); living docs. Aún incompleto. |
| 5 | Hexagonal | 10 | **3** | Ports + ElectroDB adapters reales. Sin use-cases de pago → techo bajo. |
| 6 | ROP | 10 | **1** | `Result` en repos; **sin** use-cases ROP. |
| | **Subtotal bonus** | **50** | **15** | |

---

## 5. Total estricto

```
Base   18 / 100
Bonus  15 /  50
───────────────
Total  33 / 150
```

**Resultado hiring:** **REJECT / NEEDS MAJOR WORK** — no alcanza entrevista por rúbrica (≥100 base).

### Gap mínimo a 100 (orden del panel)

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | API real 4 dominios + seed Dynamo + pay sandbox + stock/delivery | +17–19 |
| P0 | Onboarding cableado a BE (cierra criterio 3) | +8–10 |
| P0 | Jest >80% FE+BE + cifras README | +28–30 |
| P0 | Deploy AWS + README entregable | +20 + README +3–4 |
| P1 | Hex ports + ROP use-cases con tests | bonus +12–16 |
| P1 | HTTPS + Observatory | bonus +3–4 |

Sin P0 cerrado, **hablar de bonus es ruido**.

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 18 | 15 | **33** | Reject |
| + API/pago/seed cableado | 45 | 22 | **67** | Reject |
| + tests >80% documentados | 75 | 26 | **101** | Condicional pass base |
| + deploy + README + OWASP público | 98–100 | 35 | **133–135** | Strong pass posible |
| + Hex/ROP real + CSS/responsive evidencia | 100 | 42–45 | **142–145** | Hire signal |

El panel **no asume** que la proyección se cumplirá.

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
