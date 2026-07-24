# Data model — single-table DynamoDB (ElectroDB)

> Draft for README (`readme-deliverables`). Source of truth for access patterns.

## Table

| Env | Value |
|---|---|
| Name | `${DYNAMODB_TABLE_NAME}` (default `checkout-store`; override per stage in deploy) |
| Keys | `pk` (HASH), `sk` (RANGE) |
| GSI | `gsi1` (`gsi1pk` / `gsi1sk`) |
| Billing | PAY_PER_REQUEST |

Local: `docker compose up -d dynamodb` → `DYNAMODB_ENDPOINT=http://localhost:8000` → `npm run ensure-table` → `npm run seed`.

## Entities (ElectroDB)

| Entity | PK | SK | GSI1 |
|---|---|---|---|
| Product | `PRODUCT#${productId}` | `META` | `PRODUCT` / `${productId}` |
| Customer | `CUSTOMER#${customerId}` | `META` | `CUSTOMER` / `${customerId}` |
| Transaction | `TX#${transactionId}` | `META` | `TX` / `${createdAt}#${id}` |
| Delivery | `DELIVERY#${deliveryId}` | `META` | `TX#${transactionId}` / `DELIVERY#${id}` |

### Product attributes

`name`, `description`, `priceMinor`, `stock`, `imageUrl`, `imageAlt`, `kicker`

### Access patterns

| Need | How |
|---|---|
| Get product by id | GetItem `PRODUCT#id` / `META` |
| List products | Query GSI1 `PRODUCT` |
| Update / decrement stock | UpdateItem on product PK |
| Create / get customer | Put / Get `CUSTOMER#id` |
| Create / get / update transaction | Put / Get `TX#id` |
| Create / get delivery | Put / Get `DELIVERY#id`; by tx via GSI1 |

## Seed

`npm run seed` upserts 4 NORA products (ids `prod_*`) with `stock > 0`. Idempotent. No HTTP create-product.
