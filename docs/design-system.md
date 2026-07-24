# NORA Design System

> Living document. Source of truth for visual identity in `apps/web`.  
> Code: `apps/web/src/design-system/`. Spec: `specs/checkout-ui-mock/spec.md`.  
> Visual ADRs: `0007` (initial craft) → **`0008` NORA Pop + split checkout**.

## Brand

| | |
|---|---|
| Name | **NORA** |
| Voice | Playful, warm, confident — objects for brighter rooms |
| Hero rule | Brand + photography dominate; coral CTAs pop |
| Identity | **NORA Soft** — warm stone + muted clay accent |
| Product in mock | “Aura Quiet” (+ catalog) |

## Principles

1. **One job per screen** — clear purchase path.
2. **Product first** — then fluid handoff to checkout (no modal interrupt).
3. **Mobile-first** — SE base; split checkout from ~960px; fluid padding.
4. **Tokens only** — no one-off colors in features.
5. **One accent color** — clay CTA; sage for success only.

## Anti-patterns (do not ship)

- Purple / indigo gradient SaaS look
- Rainbow brand gradients / neon coral+mint+lemon
- Broadsheet dense columns
- Floating badge stickers on hero media
- Modal for primary pay path (use split flow)

## Foundations

### Color

| Token | Role | Value |
|---|---|---|
| `--nora-bg` | Warm stone | `#f6f3ee` |
| `--nora-bg-soft` | Soft wash | `#ebe6df` |
| `--nora-ink` | Text | `#22201e` |
| `--nora-cta` | Muted clay | `#c45d45` |
| `--nora-success` | Sage | `#5f7d6b` |
| `--nora-line` | Dividers | `#ddd6cc` |

### Typography

| Role | Family |
|---|---|
| Display | **Fraunces** |
| UI / body | **Outfit** |

### Radius

Soft: `sm 0.65rem` / `md 1rem` / `lg 1.5rem` / pills for chips.

### Motion

`--nora-fast/med/slow` ≈ 200 / 480 / 720ms. Split checkout: `nora-product-slide-left`, `nora-form-slide-right` (desktop); dock + rise (mobile).

## Screen recipes

### Collection

Featured hero + bento grid.

### Product

Split stage + sticky dock (mobile).

### Checkout (split flow)

Product pane left ↔ form pane right. No modal.

### Summary backdrop / Status

Sheet + vivid accents; status feedback animations.
