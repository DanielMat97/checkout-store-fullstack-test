# ADR 0014 — Enriched structured logs + CloudWatch observability

## Status

Accepted — 2026-07-25

## Context

The shared JSON logger (`createLogger` / `logHttpRequest`) already unifies Nest + Lambda access logs, but fields were minimal for ops: hard to slice by domain/layer, status class, route cardinality, or cold starts. The brief and hiring bar reward demonstrable observability (not only “logs exist”).

## Decision

1. **Enrich the standard envelope** with `stage`, `functionName`, optional `domain` / `layer` / `operation`, and HTTP fields (`statusClass`, `route`, `userAgent`, `coldStart`).
2. **Emit CloudWatch Embedded Metric Format (EMF)** alongside HTTP access logs under namespace `Checkout/API` for RequestCount + LatencyMs by Service/Stage/StatusClass.
3. **Provision with Serverless Framework**: one CloudWatch Dashboard per stage, Alarms for API 4xx/5xx, latency spike, Lambda errors; SNS topic for notifications; IAM user with **read-only** CloudWatch/Logs for dashboards.
4. **No access keys in git/CFN** — operators create keys or console password via AWS CLI after deploy.

## Consequences

- Slightly larger log lines; still redacted for PAN/secrets.
- Custom metrics incur CloudWatch metric cost (low cardinality dimensions).
- IAM viewer must be rotated/disabled when the tech test ends.
