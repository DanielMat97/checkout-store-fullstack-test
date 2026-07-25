---
feature: ux-quality-bar
status: done
owner: frontend
rubric: [2, B2, B3, B4]
---

# Spec — Barra de calidad UX (imágenes, responsive, CSS, clean FE)

## Resumen

Como evaluador de FE, confirmo imágenes sin overflow, **matriz formal** responsive multi-breakpoint/browser, CSS tokenizado (design system NORA), y código FE limpio (sin mock paths en UI live).

## Alcance

- Responsive: breakpoints SE (375), tablet (768), desktop (1280); smoke Chromium + Firefox + WebKit (Playwright).
- Overflow fixes: product dock, checkout title, form pairs, orders ids.
- Tokens: `--nora-ink-muted`, paper alphas; feature CSS sin hex/rgba sueltos (salvo flags/card brands).
- Evidencia: `docs/ux-evidence.md` + Playwright projects.
- Clean FE: CheckoutPage usa `loadProduct` (no mock catalog en live); quitar Modal muerto del DS export si no se usa.

## Fuera de alcance

- Custom domain Amplify.
- Rediseño visual completo.

## Criterios de aceptación (EARS)

- Cuando se abre catálogo/producto/checkout/orders en 375px, no debe haber scroll horizontal ni overflow de título/CTA.
- Cuando corre Playwright con projects mobile + firefox + webkit, los smokes de shell deben pasar.
- Cuando se cambia un color de UI, debe vivir en `tokens.css`.
- Cuando el scorecard re-evalúa B2/B3/B4, cita `docs/ux-evidence.md`.

## Referencias

- `docs/design-system.md`, ADR 0008
- Scorecard base #2 + bonus #2–4
