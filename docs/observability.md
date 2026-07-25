# Observability — structured logs + CloudWatch

> Feature: `observability-cloudwatch` · ADR [0014](adr/0014-observability-cloudwatch.md) · Last updated: 2026-07-25

## What you get after `serverless deploy`

| Resource | Name pattern |
|---|---|
| Dashboard | `checkout-api-<stage>-ops` |
| SNS alerts | `checkout-api-<stage>-ops-alerts` |
| IAM viewer (read-only) | `checkout-api-<stage>-cw-viewer` |
| Alarms | HTTP API **4xx** / **5xx** / **latency spike**; Lambda **Errors** per function |

Optional email on alarms: set `OBSERVABILITY_ALERT_EMAIL` before deploy (confirm the SNS subscription in inbox).

## Enriched JSON logs (`@app/shared`)

Every line shares one envelope:

| Field | Purpose |
|---|---|
| `service` / `domain` | Microservice / bounded context |
| `layer` | `http` \| `application` \| `domain` \| `adapter` \| `infrastructure` |
| `operation` | Use-case / handler key (`pay_transaction`, `http_request`, …) |
| `stage` / `functionName` | Runtime context |
| `correlationId` / `requestId` | Trace across hops |

HTTP access (`message: http.request`) also includes `route` (low cardinality), `statusClass`, `durationMs`, `coldStart`, optional `userAgent`.

Custom metrics via **EMF** → namespace `Checkout/API` (`RequestCount`, `LatencyMs`, dimensions `Service` / `Stage` / `StatusClass`).

Application example: `PayTransactionUseCase` emits `pay.outcome` / `pay.failed` (no PAN/CVV — redacted by logger).

## Dashboard widgets

1. HTTP API 4xx / 5xx  
2. HTTP API latency (avg + p99)  
3. EMF RequestCount / LatencyMs by service  
4. Lambda Errors + Duration + Invocations/Throttles  
5. SQS orders queue (+ DLQ) depth  
6. Logs Insights table of recent 4xx/5xx `http.request` (transactions log group)

## IAM viewer (no keys in git)

User is created by CloudFormation. Create console password or access keys **locally**:

```bash
STAGE=prod   # or dev / fb-…
USER=$(aws cloudformation describe-stacks --stack-name "checkout-api-$STAGE" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudWatchViewerUserName'].OutputValue" --output text)

# Optional access key (store offline — never commit)
aws iam create-access-key --user-name "$USER"
```

Policy: CloudWatch dashboards/metrics/alarms + Logs Insights **read**; explicit **Deny** on IAM/CFN/Lambda mutate, dashboard put/delete, etc.

## Verify with AWS CLI

```bash
npm run ops:observability -- --stage=prod
# or
node scripts/ops/describe-observability.cjs --stage=prod
```

Opens listing of dashboard, alarms, SNS topic, viewer user. Console deep-link is printed.

## Logs Insights snippets

```
fields @timestamp, level, service, layer, operation, message, correlationId
| filter ispresent(correlationId)
| sort @timestamp desc
| limit 50
```

```
fields @timestamp, data.route, data.statusClass, data.durationMs, data.coldStart
| filter message = "http.request"
| stats count() by data.statusClass, data.route
```

```
fields @timestamp, data.paymentStatus, data.transactionId
| filter message = "pay.outcome"
| stats count() by data.paymentStatus
```
