---
feature: security-hardening
status: ready
owner: security
rubric: [B1]
---

# Spec — OWASP headers + HTTPS demostrable

## Resumen

Como evaluador de seguridad, verifico headers OWASP en API, HTTPS en FE/API públicos, y ausencia de PAN/CVV en logs/persistencia.

## Alcance

- Headers desde `packages/shared` en **todas** las rutas de negocio (ya parcial en health).
- HTTPS obligatorio en URLs de deploy.
- Redacción de logs (bodies sensibles).
- Evidencia Mozilla Observatory (o similar) linkeada/capturada en docs (sin secrets).
- No almacenar PAN/CVV; no loguearlos.

## Criterios de aceptación (EARS)

- Cuando se inspecciona una response API desplegada, deben existir headers del set acordado (CSP/frame/nosniff/referrer/etc. según helper).
- Cuando se abre FE/API URL, el esquema debe ser `https`.
- Cuando se buscan logs de un pay, no debe aparecer número de tarjeta ni CVV.
- Cuando Observatory (u otra herramienta) evalúa el host, el resultado se documenta en current-state/README.

## Referencias

- Scorecard bonus #1
- Cursor rules OWASP / endpoint-owasp
