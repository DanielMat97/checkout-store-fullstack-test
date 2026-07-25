# UX evidence — responsive matrix (scorecard B2)

> Living document. Spec: `specs/ux-quality-bar/`.  
> Last green run: **2026-07-25** — `FE_BASE_URL=https://master.dw2i8myh0xumx.amplifyapp.com` → **4/4 projects passed**.

## Breakpoints under test

| Label | Width | Height | Notes |
|---|---|---|---|
| SE | 375 | 667 | iPhone SE project + explicit viewport |
| Tablet | 768 | 1024 | Explicit `setViewportSize` |
| Desktop | 1280 | 800 | Chromium / Firefox / WebKit desktop |

## Browsers

| Project | Engine | Specs | Live result |
|---|---|---|---|
| `chromium` | Chromium Desktop | Full e2e + responsive | ✅ |
| `chromium-se` | Chromium · iPhone SE | `responsive.smoke.spec.ts` | ✅ |
| `firefox` | Firefox Desktop | `responsive.smoke.spec.ts` | ✅ |
| `webkit` | WebKit Desktop | `responsive.smoke.spec.ts` | ✅ |

## Assertions

For catalog `/`, product detail, checkout (`/checkout` URL + `.nora-flow`), and `/orders`:

- Shell visible
- `documentElement.scrollWidth - clientWidth ≤ 1` (no horizontal overflow)

## How to run

```bash
cd apps/web
FE_BASE_URL=https://master.dw2i8myh0xumx.amplifyapp.com npx playwright test responsive.smoke.spec.ts
# or full matrix including chromium checkout smoke:
FE_BASE_URL=… npx playwright test
```

## Token / CSS notes (B3)

- Feature + DS CSS use tokens from `tokens.css` (`--nora-ink-muted`, paper alphas, veil/shadow tokens).
- Exceptions: Colombia flag SVG fills, card-brand brand colors (external marks).

## Clean FE (B4)

- Live checkout pages load products via `loadProduct` (API / mock gate), not direct mock catalog imports.
- Unused `Modal` removed from design-system exports.
