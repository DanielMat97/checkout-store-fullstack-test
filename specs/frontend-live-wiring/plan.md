---
feature: frontend-live-wiring
derived_from: spec.md
---

# Plan — FE live wiring

## Módulos

- `apps/web/src/api/` — fetch wrappers + error mapping
- Feature checkout: `checkoutService` con estrategia mock | live
- Env: `VITE_MOCK_MODE`, `VITE_API_BASE_URL`

## Secuencia Pay

1. Asegurar customer (`POST /customers`) si aplica.
2. `POST /transactions` → id + PENDING.
3. `POST /transactions/:id/pay` (card tokenized/ephemeral per gateway adapter contract — **nunca** persistir).
4. Render status from response / GET.

## Card data

- Viaja solo en memoria al endpoint de pay (HTTPS en deploy).
- No Redux persist.

## Tasks

Ver `tasks.md`.
