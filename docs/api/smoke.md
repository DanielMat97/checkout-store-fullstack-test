# API smoke (local)

Prereqs: DynamoDB Local + seed + API offline. Copy `.env.example` → **root** `.env` (gitignored) with `DYNAMODB_ENDPOINT` + `PAYMENT_GATEWAY_MODE=fake`. `serverless.ts` uses `useDotenv: true`.

```bash
npm run dynamodb:up
# .env: DYNAMODB_ENDPOINT=http://localhost:8000, PAYMENT_GATEWAY_MODE=fake
npm run ensure-table
npm run seed
npm run build:api && npx serverless offline start
```

## Happy path

```bash
BASE=http://localhost:3000

# Products
curl -s "$BASE/products" | jq '.items | length'
curl -s "$BASE/products/prod_aura_quiet" | jq '{id,stock,priceMinor}'
curl -s "$BASE/products/prod_aura_quiet/stock" | jq .

# Customer
CUST=$(curl -s -X POST "$BASE/customers" \
  -H 'content-type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","phone":"+573001112233"}')
echo "$CUST" | jq .
CID=$(echo "$CUST" | jq -r .id)

# Transaction PENDING
TX=$(curl -s -X POST "$BASE/transactions" \
  -H 'content-type: application/json' \
  -d "{\"productId\":\"prod_aura_quiet\",\"customerId\":\"$CID\",\"productAmount\":45990000,\"baseFee\":1500,\"deliveryFee\":5000,\"delivery\":{\"address\":\"Calle 1\",\"city\":\"Bogotá\",\"region\":\"Cundinamarca\"}}")
echo "$TX" | jq .
TID=$(echo "$TX" | jq -r .transaction.id)
DID=$(echo "$TX" | jq -r .deliveryId)

# Pay (fake gateway APPROVED)
curl -s -X POST "$BASE/transactions/$TID/pay" \
  -H 'content-type: application/json' \
  -d "{\"deliveryId\":\"$DID\",\"card\":{\"number\":\"4242424242424242\",\"cvc\":\"123\",\"expMonth\":\"12\",\"expYear\":\"30\",\"cardHolder\":\"Ada Lovelace\"}}" \
  | jq '{paymentStatus, status: .transaction.status}'

# Stock decreased
curl -s "$BASE/products/prod_aura_quiet/stock" | jq .
curl -s "$BASE/deliveries/$DID" | jq '{id,status}'
```

Validation 400 example:

```bash
curl -s -o /tmp/out -w "%{http_code}" -X POST "$BASE/customers" \
  -H 'content-type: application/json' -d '{"fullName":""}'
cat /tmp/out
```

OpenAPI (Apidog-importable, full success + error bodies per endpoint): [`docs/api/openapi.json`](openapi.json) · public copy served at Amplify `/openapi.json`.
