---
feature: architecture-hex-rop
status: ready
owner: backend
rubric: [B5, B6, B4]
---

# Spec — Hexagonal real + Railway Oriented Programming

## Resumen

Como arquitecto evaluador, veo **puertos + adapters + use-cases** con ROP (`Result`/`neverthrow`), no solo carpetas vacías.

## Alcance

- Cada dominio: `domain/` (entities/errors) + `application/` (use-cases) + `adapters/inbound|outbound`.
- Use-cases retornan `Result<Success, DomainError>`; no try/catch para control de flujo esperado.
- Controllers solo: parse → call use-case → map Result → HTTP.
- Tests de use-case con fakes de puertos (sin Nest).

## Criterios de aceptación (EARS)

- Cuando se abre un controller de pay/create, no debe haber reglas de stock/pasarela inline.
- Cuando un use-case enfrenta DECLINED, debe retornar `ok`/`err` tipado según diseño, no throw.
- Cuando se testea PayTransaction con fake gateway DECLINED, stock port **no** debe recibir decrement.
- Cuando el scorecard evalúa Hex/ROP, debe haber ≥1 use-case real con tests — no solo ADR.

## Referencias

- ADR 0001, 0002
- Scorecard bonus #5–6 (y aporta a clean code)
