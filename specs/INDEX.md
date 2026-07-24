# Specs index — path to 100% (rúbrica)

> Generado: 2026-07-24.  
> Objetivo: **100 pts base** (aprobar) y ruta clara a **hasta 150** (bonus).  
> Implementación: **no** incluida en este lote — solo contratos SDD (`spec` / `plan` / `tasks`).

## Estado de features

| Feature | Carpeta | Estado spec | Cierra rúbrica |
|---|---|---|---|
| UI mock (hecho) | `checkout-ui-mock/` | **done** | Base #2 parcial, #3 UI, bonus CSS/responsive parcial |
| Pago E2E (contrato negocio) | `checkout-payment/` | **ready** | Base #3 (mitad sistema) |
| Persistencia + seed | `persistence-seed/` | **ready** | Base #4 prereq; brief seed |
| APIs 4 dominios | `api-domains/` | **ready** | Base #4 (20) |
| Pasarela sandbox | `payment-gateway/` | **ready** | Base #3 pasos 5.1–5.3 |
| FE live (off mock) | `frontend-live-wiring/` | **ready** | Base #3 completo |
| Cobertura Jest | `testing-coverage/` | **ready** | Base #5 (30) |
| Deploy AWS | `cloud-deploy/` | **ready** | Base #6 (20) |
| README entregable | `readme-deliverables/` | **ready** | Base #1 (5) |
| Seguridad OWASP/HTTPS | `security-hardening/` | **ready** | Bonus #1 (5) |
| Hexagonal + ROP real | `architecture-hex-rop/` | **ready** | Bonus #5–6 (20) |
| Barra UX/calidad | `ux-quality-bar/` | **ready** | Base #2 resto + bonus #2–4 |

## Orden de implementación (obligatorio)

```
1. persistence-seed
2. architecture-hex-rop   (puertos/ROP desde el primer use-case)
3. payment-gateway
4. api-domains            (orquesta use-cases; OpenAPI)
5. checkout-payment       (cierre E2E dominio; puede solaparse con 3–4)
6. frontend-live-wiring
7. testing-coverage
8. security-hardening     (headers ya parcial; HTTPS en deploy)
9. cloud-deploy
10. readme-deliverables
11. ux-quality-bar        (evidencia Lighthouse/browsers; polish)
```

`checkout-ui-mock` ya está **done** — no reabrir salvo regresión.

## Mapa rúbrica → evidencia de cierre

| # | Criterio | Pts | Spec(s) que lo cierran |
|---|---|---|---|
| 1 | README | 5 | `readme-deliverables` |
| 2 | Imágenes / overflow | 5 | `checkout-ui-mock` + `ux-quality-bar` |
| 3 | Onboarding tarjeta completo | 20 | `checkout-payment` + `payment-gateway` + `frontend-live-wiring` |
| 4 | API funcionando | 20 | `api-domains` + `persistence-seed` |
| 5 | Tests >80% FE+BE | 30 | `testing-coverage` |
| 6 | Deploy cloud | 20 | `cloud-deploy` |
| B1 | OWASP/HTTPS | 5 | `security-hardening` |
| B2 | Responsive multi-browser | 5 | `ux-quality-bar` |
| B3 | CSS | 10 | `checkout-ui-mock` + `ux-quality-bar` |
| B4 | Código limpio | 10 | `architecture-hex-rop` + `ux-quality-bar` |
| B5 | Hexagonal | 10 | `architecture-hex-rop` |
| B6 | ROP | 10 | `architecture-hex-rop` |

## Reglas al implementar

1. Leer `AGENTS.md` → `docs/current-state.md` → ADR → **este índice** → `spec` → `plan` → `tasks`.
2. No contradecir ADRs 0001–0008 sin nuevo ADR.
3. Actualizar scorecard estricto al cerrar cada feature.
4. Repo público: **sin** marca de la pasarela; secrets solo env.
5. Living docs en el mismo cambio.

## Definition of “100% base”

Todas las checkboxes de `tasks.md` en:

- `persistence-seed`
- `payment-gateway`
- `api-domains`
- `frontend-live-wiring`
- `testing-coverage`
- `cloud-deploy`
- `readme-deliverables`

…y scorecard panel ≥ **100 / 100** base con evidencia (URLs, coverage %, OpenAPI).
