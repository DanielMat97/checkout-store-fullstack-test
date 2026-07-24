---
feature: checkout-ui-mock
derived_from: spec.md
---

# Plan técnico — Maqueta UI + Design System NORA

## Arquitectura FE

```
apps/web/src/
  design-system/          # tokens + primitives + patterns (única fuente de identidad)
  mocks/                  # catalog, fees, checkout simulation
  features/checkout/      # pages + modal wired to Redux
  store/                  # checkout slice + persist (safe fields only)
  styles/global.css       # imports tokens + base reset
```

## Design system

- Tokens CSS variables en `:root` (`tokens.css`) + mirror TS (`tokens.ts`) para tests.
- Componentes presentacionales sin fetch; reciben props.
- Documentar en `docs/design-system.md` (principios, tokens, do/don't, anatomía de pantallas).

## Estado (Redux)

Extender `checkout` slice:

- `step`, `productId`, `delivery`, `cardMeta`, `transactionId`, `paymentStatus`
- `mockStock` (override local en mock mode)
- `simulateDecline` boolean
- Nunca persistir PAN/CVV

## Mock API

`mocks/checkoutService.ts`:

- `getProduct()` 
- `submitCheckout()` → delay → APPROVED | DECLINED → adjust stock

Feature flag: `import.meta.env.VITE_MOCK_MODE !== 'false'`

## Rutas

| Path | UI |
|---|---|
| `/` | Product |
| `/checkout` | Product + Modal open |
| `/summary` | Backdrop summary |
| `/status` | Final status |

## Librerías

- Ya: React, Redux Toolkit, redux-persist, react-router.
- Fonts: Syne + DM Sans (link Google Fonts en `index.html`).
- Sin CSS framework externo (CSS modules / plain CSS del DS).

## Skills aplicadas

| Skill | Uso |
|---|---|
| checkout-flow | Orden 5 pantallas + reglas de negocio mock |
| uiux / accessibility | Focus trap, labels, contraste |
| motion-design | Timings modal/backdrop/status |
| vercel-react-view-transitions | Transiciones de ruta suaves si el browser soporta |

## Riesgos

- Persistencia accidental de PAN → whitelist explícita en persist.
- Overflow en SE → probar 375px; imagen con max-width 100%.
