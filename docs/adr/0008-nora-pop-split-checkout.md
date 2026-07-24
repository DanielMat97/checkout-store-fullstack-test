# ADR 0008 — NORA Soft identity + split checkout flow

- **Status:** Accepted (palette refined 2026-07-24)
- **Date:** 2026-07-24
- **Supersedes (visual tone):** ADR 0007 quiet parchment; earlier hot coral/mint “Pop”

## Context

Need a playful but calmer brand, plus continuous checkout (product left / form right) instead of a modal. First Pop palette was too loud; refined to **NORA Soft**.

## Decision

1. **Palette:** warm stone `#f6f3ee`, ink `#22201e`, **one** muted clay CTA `#c45d45`, sage success. No rainbow gradients.
2. **Type:** Fraunces + Outfit; soft radii.
3. **Checkout:** split flow with responsive breakpoints (stacked &lt;960px, split ≥960px).
4. **Layout:** fluid `--nora-shell-pad-x`, clamped hero heights, consistent 640/900–960 breakpoints.

## Consequences

- Calmer UI that still feels branded and fun.
- Better SE / tablet / desktop behavior without losing the split-pay motion on desktop.
