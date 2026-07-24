---
feature: persistence-seed
status: ready
owner: backend
rubric: [4]
---

# Spec — Persistencia DynamoDB + seed de productos

## Resumen

Como sistema, persisto products/customers/deliveries/transactions en DynamoDB vía ElectroDB, con **seed ≥3 productos** con stock > 0 (sin endpoint de create-product).

## Alcance

- Tablas/entities ElectroDB según ADR 0004.
- Seed reproducible (`npm run seed` o script documentado).
- Productos alineados al catálogo NORA mock (≥3; ideal 4).
- Access patterns: get product by id, update stock, create/get transaction, create customer, create/get delivery.

## Fuera de alcance

- Migraciones complejas multi-región.
- Endpoint admin create-product.

## Criterios de aceptación (EARS)

- Cuando se ejecuta el seed en un ambiente vacío, el sistema debe dejar ≥3 productos con `stock > 0` consultables.
- Cuando se lee un producto por id, el sistema debe devolver name, description, price (minor), stock, imageUrl.
- Cuando se decrementa stock en dominio, el valor persistido debe reflejar el nuevo stock.
- Cuando no existe el producto, el puerto/repositorio debe fallar de forma tipada (ROP), no con excepción opaca sin mapear.

## Referencias

- ADR 0004, plan modelo en `api-domains` / README futuro
- Scorecard: sin seed la API no cierra
