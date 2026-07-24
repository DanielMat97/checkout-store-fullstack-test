# NORA Design System

> Living document. Source of truth for visual identity in `apps/web`.  
> Code: `apps/web/src/design-system/`. Spec: `specs/checkout-ui-mock/spec.md`.

## Brand

| | |
|---|---|
| Name | **NORA** |
| Voice | Clear, calm, precise — home/audio retail |
| Hero rule | Brand is a hero-level signal on every primary viewport (not just nav text) |
| Product in mock | “Aura Quiet Headphones” |

## Principles

1. **One job per screen** — no dashboard clutter in checkout.
2. **Product first** — imagery and price before chrome.
3. **Mobile-first** — design at 375px; enhance upward.
4. **Tokens only** — no one-off colors/spacing in features.
5. **Accessible by default** — labels, focus, contrast, reduced motion.

## Anti-patterns (do not ship)

- Purple / indigo gradient SaaS look
- Cream canvas + terracotta + default serif “editorial AI”
- Broadsheet dense columns with hairline rules everywhere
- Pill soup, floating badge stickers on the hero image
- Multi-layer neon glow shadows

## Foundations

### Color

| Token | Role | Value |
|---|---|---|
| `--nora-ink` | Primary text / surfaces dark | `#0B1220` |
| `--nora-mist` | Page background | `#E8EEF5` |
| `--nora-paper` | Elevated surface | `#F7FAFC` |
| `--nora-citrus` | Accent / primary CTA fill | `#C8F542` |
| `--nora-citrus-ink` | Text on citrus | `#10180A` |
| `--nora-slate` | Secondary text | `#5A6B7D` |
| `--nora-line` | Dividers | `#C9D4E2` |
| `--nora-danger` | Errors | `#B42318` |
| `--nora-success` | Approved | `#0E7A4B` |

### Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Syne** | Brand, product title |
| UI / body | **DM Sans** | Forms, fees, buttons |

Scale: `12 / 14 / 16 / 20 / 28 / 40` with tight display leading.

### Space & radius

- Space scale: `4, 8, 12, 16, 24, 32, 48`
- Radius: `sm 8`, `md 14`, `lg 22` (no pill CTAs)
- Touch min: 44px

### Motion

| Token | Value |
|---|---|
| `--nora-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--nora-fast` | 180ms |
| `--nora-med` | 240ms |

Honor `prefers-reduced-motion`.

## Components

### Primitives

- `Button` — `primary` \| `ghost` \| `danger`
- `TextField` — label, hint, error, `aria-*`
- `Badge` — stock / status
- `Surface` — paper elevation

### Patterns

- `BrandLockup` — NORA wordmark
- `Modal` — dialog + scrim + focus trap
- `Backdrop` — Material-like summary layer
- `Price` — currency formatting (COP mock)
- `StockBadge`
- `CardBrandMark` — visa \| mastercard \| unknown
- `FeeList` — product + base + delivery + total

## Screen recipes

### Product

Brand → image plane → title → lede → price/stock row → primary CTA.

### Modal checkout

Two stacked groups (Card, Delivery); sticky footer Continue.

### Summary backdrop

Scrim + rising panel; fee list; Pay.

### Status

Icon + title + body + transaction id + CTA home.

## Scaling

New screens must:

1. Reuse tokens/components.
2. Add patterns to `design-system/` if reused twice.
3. Update this doc + CHANGELOG.

## Mock mode

`VITE_MOCK_MODE=true` (default): UI talks to `src/mocks/*` only.  
Set `false` when wiring real API Gateway (`VITE_API_BASE_URL`).
