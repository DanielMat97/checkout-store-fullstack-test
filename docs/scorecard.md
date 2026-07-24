# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-24** (post `api-domains`)  
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
| Arquitecto | 4 dominios HTTP + OpenAPI + ValidationPipe. **FE aún mock**. |
| Líder técnico | Contratos listos; falta `.env` root + coverage/deploy/README. |
| Product Owner | API puede completar 5.x; **UI no consume API**. |
| Security | Headers + validation; pay aún manda tarjeta al BE. |
| Hiring bar | **Aún no.** Backend usable; no aprueba base. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **29 / 100** |
| **Bonus** | **29 / 50** |
| **Total** | **58 / 150** |
| **¿Aprueba (≥100 base)?** | **No** |

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1–4 UI + fees | Mock NORA Soft | OK. | ✅ |
| 5.1–5.3 BE | Create/Pay + sandbox + APIs | BE listo; FE no. | 🟡 |
| 4 dominios API | OpenAPI 0.3 + DTOs + stock | Cumple contrato; smoke doc existe. | ✅ |
| Seed | `npm run seed` | OK. | ✅ |
| Jest >80% + README | No | **Fallo duro.** | ❌ |
| Deploy cloud | No | **Fallo duro.** | ❌ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README completado | 5 | **1** | Sin entregable completo. |
| 2 | Imágenes / sin desborde | 5 | **4** | Sin cambio. |
| 3 | Onboarding pago completo | 20 | **12** | BE completo; FE mock. |
| 4 | API funcionando | 20 | **12** | 4 dominios + OpenAPI + validation + stock. −8: smoke live no verificado en corte / sin deploy. |
| 5 | Unit tests >80% FE y BE | 30 | **0** | Sin umbral documentado. |
| 6 | Deploy cloud | 20 | **0** | Sin URL. |
| | **Subtotal base** | **100** | **29** | |

**Base oficial del corte: 29 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP + HTTPS + headers | 5 | **1** | Headers sí; HTTPS público no. |
| 2 | Responsive multi-browser | 5 | **2** | Sin matriz. |
| 3 | Habilidades CSS | 10 | **6** | Sin cambio. |
| 4 | Código limpio | 10 | **5** | DTOs + thin controllers. |
| 5 | Hexagonal | 10 | **8** | Sin cambio material. |
| 6 | ROP | 10 | **7** | Sin cambio material. |
| | **Subtotal bonus** | **50** | **29** | |

---

## 5. Total estricto

```
Base   29 / 100
Bonus  29 /  50
───────────────
Total  58 / 150
```

**Resultado hiring:** **REJECT / NEEDS MAJOR WORK**.

### Gap mínimo a 100

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | FE live + onboarding E2E | +6–8 (#3) |
| P0 | Smoke live + polish API | +4–6 (#4) |
| P0 | Jest >80% + README | +28–30 |
| P0 | Deploy + README URLs | +20 +4 |

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 29 | 29 | **58** | Reject |
| + FE live | 42 | 30 | **72** | Reject |
| + tests >80% | 72 | 32 | **104** | Condicional pass base |
| + deploy + README + OWASP | 98–100 | 40 | **138–140** | Strong pass posible |

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
