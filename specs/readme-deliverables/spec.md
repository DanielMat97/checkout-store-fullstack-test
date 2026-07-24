---
feature: readme-deliverables
status: ready
owner: docs
rubric: [1]
---

# Spec — README entregable de prueba

## Resumen

Como evaluador, abro el README del repo público y encuentro todo lo pedido para calificar sin adivinar.

## Alcance (contenido mínimo)

- Descripción del producto/checkout.
- Stack (React+Redux, Nest, SF4, DynamoDB/ElectroDB, Jest).
- Cómo correr local (`npm run dev`, seed, mock vs live).
- **Modelo de datos** (tablas/entities + diagrama o tabla).
- **OpenAPI / Postman**: link a `docs/api/openapi.json` o collection.
- **Coverage**: cifras FE y BE >80% + comando.
- **URLs desplegadas** FE + API.
- Decisiones breves (hex/ROP) o link a ADRs.
- Aviso: no incluir marca de pasarela ni secrets.

## Criterios de aceptación (EARS)

- Cuando un revisor solo lee README, debe poder localizar modelo, API docs, coverage y URLs.
- Cuando el README menciona env, debe apuntar a `.env.example` sin valores secretos.
- Cuando se busca la marca comercial de la pasarela en README, no debe existir.

## Referencias

- Scorecard base #1 (5 pts)
- Entregables brief § README
