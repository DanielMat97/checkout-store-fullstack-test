---
feature: ux-quality-bar
status: ready
owner: frontend
rubric: [2, B2, B3, B4]
---

# Spec — Barra de calidad UX (imágenes, responsive, CSS, clean FE)

## Resumen

Como evaluador de FE, confirmo imágenes sin overflow/perf aceptable, responsive multi-breakpoint/browser, CSS de producto (design system), y código FE limpio.

## Alcance

- Imágenes: dimensiones, `aspect-ratio`, lazy, evitar CLS; preferir assets propios o CDN con sizes; evidencia Lighthouse (perf images) en docs.
- Responsive: SE (375), tablet (768), desktop (1280); smoke Chrome + Safari/Firefox (o documentar matriz).
- CSS: tokens/design system NORA Soft; sin hex sueltos en features.
- Clean code FE: features desacopladas, sin dead mock paths rotos, nombres claros.

## Criterios de aceptación (EARS)

- Cuando se abre el catálogo/producto en 375px, no debe haber scroll horizontal ni imágenes desbordadas.
- Cuando se corre Lighthouse (mobile) sobre FE deploy/local build, no debe haber fallos graves de image sizing documentados como bloqueantes.
- Cuando se cambia un color, debe vivir en tokens (`tokens.css`), no en CSS de página.
- Cuando el scorecard re-evalúa #2/B2/B3/B4, debe citar evidencias (capturas/matriz/Lighthouse).

## Referencias

- `docs/design-system.md`, ADR 0008
- Scorecard base #2 + bonus #2–4
