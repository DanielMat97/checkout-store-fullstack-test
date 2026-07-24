# ADR 0007 — Premium ecommerce visual system (Apple × Aesop × Glossier)

- **Status:** Accepted
- **Date:** 2026-07-24

## Context

The checkout mock needed a distinctive, high-craft UI that scores on CSS/detail and stands out in review. Industry references repeatedly cite **Apple**, **Aesop**, and **Glossier** as leading ecommerce visual/UX benchmarks (product-first simplicity, editorial quiet luxury, soft community-led minimalism).

## Decision

Adopt a **hybrid design language** for NORA (not a clone of any brand):

| Reference | Borrow |
|---|---|
| Apple | Photography-first hero, chrome recession, one clear CTA, premium motion (350–600ms, no bounce) |
| Aesop | Parchment/charcoal palette, sharp corners, serif display + utilitarian sans, whitespace over shadows |
| Glossier | Soft blush ambient, approachable microcopy, gentle enter/exit of UI layers |

Implementation: redesign `apps/web/src/design-system` tokens + components; document in `docs/design-system.md`. Motion via CSS (+ View Transitions API where supported). No new animation library dependency in this ADR.

## Consequences

- Stronger visual differentiation for the tech test.
- Must avoid trademarked logos/copy; inspiration only.
- Prefer typographic hierarchy and space over decorative chrome.
