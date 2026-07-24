---
feature: checkout-ui-mock
status: ready
owner: frontend
mode: mock-first
---

# Spec — Maqueta UI/UX completa (modo mock navegable)

## Resumen

Como cliente de la tienda **NORA**, quiero recorrer el onboarding de compra con tarjeta de punta a punta en una maqueta navegable (sin backend real), para validar el diseño funcional al 100% antes de cablear APIs.

Esta feature entrega la **identidad visual**, el **design system** y el **flujo de 5 pantallas** del brief, 100% clickeable en `VITE_MOCK_MODE=true`.

## Objetivos de producto / rúbrica UI

| Criterio brief | Cómo se cubre en esta maqueta |
|---|---|
| Producto + stock + precio + descripción | Product page con imagen optimizada, badge de stock, precio formateado |
| CTA **"Pay with credit card"** | Botón primario exacto; abre modal de tarjeta/entrega |
| Validación de tarjeta (estructura real, datos falsos) | Luhn + expiry futura + CVV; errores inline |
| Logos VISA / Mastercard | Detección por BIN + iconos en el campo |
| Datos de entrega | Nombre, email, teléfono, dirección, ciudad, región |
| Resumen en **Backdrop** | Producto + fee base (siempre) + fee entrega + total + CTA Pay |
| Estado final + vuelta a producto con stock | Status screen + redirect; stock mock decrementa solo si APPROVED |
| Mobile-first / iPhone SE / sin overflow | Layout ≤375px base; touch ≥44px |
| Resiliencia refresh | Redux + redux-persist (sin PAN/CVV) |
| CSS / detalle / a11y | Design system + motion + WCAG 2.1 AA |

## Marca e identidad

| Token | Valor |
|---|---|
| Brand name | **NORA** (hero-level en cada pantalla) |
| Personalidad | Editorial retail tech: precisa, cálida-fria, no “fintech púrpura” |
| Promesa visual | Producto como ancla; UI limpia; un trabajo por pantalla |

### Dirección visual (anti-cliché)

- **No** usar: purple-on-white, cream+#terracotta serif, broadsheet hairlines, dark-glow neumorphism, pills saturados.
- **Sí:** fondo niebla tinta (`ink` / `mist`), acento **citrus** (`#C8F542`), tipografía **Syne** (display) + **DM Sans** (UI), superficies `paper` con radio contenido, motion corta (180–280ms).

Documentación canónica: `docs/design-system.md`.

## Flujo de pantallas (estricto)

```
1. Product (/) 
   → CTA "Pay with credit card"
2. Card + Delivery (modal sobre product; ruta /checkout refleja estado)
   → Continue
3. Summary Backdrop (/summary)
   → Pay
4. Status (/status)  [APPROVED | DECLINED]
   → Continue shopping
5. Product (/) con stock actualizado si APPROVED
```

### Wireframes funcionales (comportamiento)

#### 1. Product page

- **Hero brand:** “NORA” dominante.
- **Una composición:** imagen full-bleed superior (aspect 4/5 mobile), debajo título producto, 1 párrafo, precio, stock.
- CTA primario full-width: `Pay with credit card`.
- Banner opcional “Mock mode” (dev only, no tapa el hero).
- Imagen: dimensiones fijas / `aspect-ratio`; `alt` descriptivo; sin overflow.

#### 2. Modal Card + Delivery

- `role="dialog"`, focus trap, ESC cierra, overlay click cierra (si no hay dirty crítico — en mock: confirma).
- Secciones: **Card** | **Delivery** (una columna mobile).
- Campos card: number (mask spaces), holder, expiry MM/YY, CVV.
- Brand logo VISA/MC a la derecha del número cuando se detecte.
- Delivery: fullName, email, phone, address, city, region.
- Validación **inline on blur + on submit**; bloquea Continue si inválido.
- Persistencia: solo `cardMeta` (brand, last4, holder) — **nunca** PAN/CVV en persist.

#### 3. Summary Backdrop (Material Backdrop)

- Capa inferior scrim; panel frontal con:
  - Brand + título “Order summary”
  - Líneas: Product, Base fee, Delivery fee, **Total**
  - Last4 + brand
  - Destino de entrega resumido
  - CTA `Pay`
  - Link/back a editar datos
- Fees mock fijos: `baseFee` y `deliveryFee` desde config mock (alineados a `.env.example`).

#### 4. Status

- Estados visuales distintos (no solo color): icono + título + cuerpo + id transacción mock.
- APPROVED: tono éxito; DECLINED: tono alerta.
- Toggle mock (solo mock mode): “Simulate decline” antes de Pay o query `?result=declined`.
- CTA vuelve a Product.

#### 5. Product return

- Si APPROVED: stock = stock − 1 (mock store).
- Si DECLINED: stock intacto.

## Modo mock (obligatorio)

| Flag | Default |
|---|---|
| `VITE_MOCK_MODE` | `true` en local hasta T8 |

Mock debe:

- Servir catálogo seed (≥1 producto destacado; ideal 1 en UI principal).
- Simular latencia 400–900ms en Pay (estado PENDING visual).
- Generar `transactionId` fake.
- Resolver APPROVED por defecto; DECLINED si el usuario elige simular rechazo.
- No llamar API Gateway real.

Cuando `VITE_MOCK_MODE=false`, la misma UI consume APIs (fuera de alcance de **esta** feature; contrato listo).

## Criterios de aceptación (EARS)

- Cuando el usuario abre `/`, el sistema debe mostrar producto NORA con precio, stock e imagen sin desborde en viewport 375px.
- Cuando el usuario pulsa **Pay with credit card**, el sistema debe abrir el modal de tarjeta/entrega con foco inicial en el primer campo.
- Cuando el usuario envía el modal con datos inválidos, el sistema debe impedir el avance y marcar campos con `aria-invalid` + mensaje.
- Cuando el número pasa Luhn y BIN Visa/MC, el sistema debe mostrar el logo correspondiente.
- Cuando el usuario completa el modal válido, el sistema debe navegar al summary backdrop con desglose producto + base fee + delivery fee.
- Cuando el usuario confirma Pay en mock, el sistema debe mostrar estado PENDING breve y luego Status APPROVED o DECLINED.
- Cuando el pago mock es APPROVED y vuelve a Product, el stock visible debe ser menor en 1.
- Cuando el usuario refresca en `/summary` o `/checkout`, el sistema debe restaurar el paso sin PAN/CVV.
- Cuando un lector de pantalla recorre el modal, todos los inputs deben tener label asociado.

## Design system (centralizado)

Ubicación código: `apps/web/src/design-system/`.  
Ubicación docs: `docs/design-system.md`.

### Capas

1. **Tokens** — color, type, space, radius, elevation, motion, z-index.
2. **Primitives** — Button, TextField, IconButton, Badge, Surface, Scrim.
3. **Patterns** — Modal, Backdrop, Price, StockBadge, CardBrandMark, BrandLockup, FeeList.
4. **Layouts** — `AppShell` (mobile column), `ProductHero`.

### Reglas de uso

- Prohibido hardcodear hex/spacing fuera de tokens (excepto mocks de contenido).
- Todo componente interactivo del flujo debe importarse desde `@/design-system` (o `design-system`).
- Variantes tipadas (primary / ghost / danger); no crear botones one-off.

## Motion (skills motion / view-transitions)

Mínimo 2–3 motions intencionales:

1. Modal: fade scrim + slide-up panel (220ms, ease-out).
2. Backdrop summary: panel rise.
3. Status: soft fade-in del resultado.

Respetar `prefers-reduced-motion: reduce` (solo fade o nada).

## Accesibilidad

- Contraste texto ≥ 4.5:1; CTA citrus sobre ink con texto ink oscuro sobre citrus.
- Focus ring visible (`--focus-ring`).
- Touch target ≥ 44×44.
- No información solo por color (errores con texto + icono).

## Fuera de alcance de esta feature

- Integración real con microservicios / pasarela.
- Cobertura Jest >80% global (sí: tests unitarios de validators + 1–2 components del DS).
- Deploy producción.

## Referencias

- Brief: `docs/fullstack-test.md` (local)
- Negocio: `specs/checkout-payment/spec.md`
- Skills: `checkout-flow`, `uiux`, `motion-design`, `vercel-react-view-transitions`, `accessibility-auditing`
- Rules: `frontend-react-redux`, `uiux`, `checkout-flow`, `checkout-validation`, `living-docs`
