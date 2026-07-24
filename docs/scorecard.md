# Scorecard — evaluación estricta (hiring bar)

> Fuente rúbrica: `docs/fullstack-test.md` (100 base + 50 bonus).  
> Última evaluación: **2026-07-24** (post `architecture-hex-rop`)  
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
| Arquitecto | Hex + ROP reales en transactions (Create/Pay + tests). **Pasarela aún fake** — no es integración sandbox. |
| Líder técnico | Use-cases testeables; **coverage global / deploy / README entregable ausentes**. |
| Product Owner | PENDING/pay existen en BE; **FE sigue en mock** → journey brief 5.x incompleto E2E. |
| Security | Sin PAN en repos; pay body aún transporta tarjeta al fake — **PCI story incompleta hasta sandbox tokenizado**. |
| Hiring bar | **Aún no.** Avance serio de backend; no cierra rúbrica base. |

| | Puntos (modo estricto) |
|---|---|
| **Base** | **21 / 100** |
| **Bonus** | **28 / 50** |
| **Total** | **49 / 150** |
| **¿Aprueba (≥100 base)?** | **No** |

> Nota: `FakePaymentGateway` **no** cuenta como paso 5.2 del brief.

---

## 2. Alineación al proceso de negocio (PO + Arquitecto)

| Paso brief | Evidencia | Nota del panel | Score parcial |
|---|---|---|---|
| 1. UI producto + stock + precio + descripción | Catálogo + detalle | Cumple y excede (catálogo). OK. | ✅ |
| 2. CTA exacto + modal tarjeta | Split checkout | OK. | ✅ |
| 3. Validación tarjeta + VISA/MC | Luhn/expiry/CVV + logos | OK a nivel FE. | ✅ |
| 3b. Delivery | Campos presentes | OK. | ✅ |
| 4. Backdrop fees (base + delivery) | FeeList | OK. | ✅ |
| 5.1 Tx `PENDING` en **backend propio** | `CreateTransactionUseCase` + HTTP | **BE sí**; FE no cableado. | 🟡 |
| 5.2 Llamada pasarela sandbox | `FakePaymentGateway` | **Fallo duro** vs brief (exige sandbox). | ❌ |
| 5.3 Update tx + delivery + stock BE | `PayTransactionUseCase` + tests | Lógica sí con fake; no sandbox. | 🟡 |
| 6. Status + producto con stock | Mock FE | Demo UI only. | 🟡 |
| Persistencia segura progreso | redux-persist sin PAN | Bien; falta prueba de amenaza. | 🟡 |
| 4 dominios API | Controllers thin + OpenAPI | Parcial — falta validación/DTOs/smoke E2E documentado. | 🟡 |
| Seed DB ≥ productos | `npm run seed` | OK. | ✅ |
| Jest >80% FE+BE + README | No | **Fallo duro.** | ❌ |
| Deploy cloud | No | **Fallo duro.** | ❌ |

---

## 3. Puntaje base (100) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | README completado | 5 | **1** | Aún no entregable de prueba (sin coverage/URLs). |
| 2 | Imágenes / sin desborde | 5 | **4** | Sin cambio material. |
| 3 | Onboarding pago completo | 20 | **10** | BE desbloquea mitad del sistema; FE mock + sin sandbox → techo 50%. |
| 4 | API funcionando | 20 | **6** | Endpoints de negocio existen (list/get/create/pay). −14: fake gateway, sin smoke E2E/deploy, DTOs flojos. |
| 5 | Unit tests >80% FE y BE | 30 | **0** | Hay tests de use-case; **sin** umbral 80% documentado → 0. |
| 6 | Deploy cloud | 20 | **0** | Sin URL pública. |
| | **Subtotal base** | **100** | **21** | |

**Base oficial del corte: 21 / 100.**

---

## 4. Bonus (50) — calificación dura

| # | Criterio | Max | **Strict** | Justificación del panel |
|---|---|---|---|---|
| 1 | OWASP + HTTPS + headers | 5 | **1** | Sin HTTPS público / Observatory. |
| 2 | Responsive multi-browser | 5 | **2** | Sin matriz browsers. |
| 3 | Habilidades CSS | 10 | **6** | Sin cambio material. |
| 4 | Código limpio | 10 | **5** | Capas hex claras + tests ROP; monolito de orquestación en transactions aceptable. |
| 5 | Hexagonal | 10 | **7** | Ports + adapters + use-cases + HTTP thin + tests con fakes. −3: payment adapter no es el real. |
| 6 | ROP | 10 | **7** | Create/Pay retornan `Result`; DECLINED sin decrement probado. −3: no todo el sistema orquestado vía ROP E2E. |
| | **Subtotal bonus** | **50** | **28** | |

---

## 5. Total estricto

```
Base   21 / 100
Bonus  28 /  50
───────────────
Total  49 / 150
```

**Resultado hiring:** **REJECT / NEEDS MAJOR WORK** — no alcanza entrevista por rúbrica (≥100 base).

### Gap mínimo a 100 (orden del panel)

| Prioridad | Trabajo | Pts base ≈ |
|---|---|---|
| P0 | Sandbox payment + FE live + cerrar onboarding | +8–10 (#3) |
| P0 | API E2E + OpenAPI completo | +10–12 (#4) |
| P0 | Jest >80% FE+BE + cifras README | +28–30 |
| P0 | Deploy AWS + README entregable | +20 + README +3–4 |
| P1 | HTTPS + Observatory | bonus +3–4 |

Sin P0 cerrado, **hablar de 100 es ruido**.

---

## 6. Proyección (no cuenta para “hoy”)

| Hito | Base ≈ | Bonus ≈ | Total ≈ | Hiring |
|---|---|---|---|---|
| Hoy | 21 | 28 | **49** | Reject |
| + sandbox + FE live | 40 | 30 | **70** | Reject |
| + tests >80% documentados | 70 | 32 | **102** | Condicional pass base |
| + deploy + README + OWASP público | 98–100 | 38 | **136–138** | Strong pass posible |

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
