# Plan — sqs-orchestration

1. Extender `TransactionRecord` con `effectsApplied?: boolean`, `deliveryId?: string` (optional denorm for worker).
2. Port `OrderEventsPublisher` + `SqsOrderEventsPublisher` + `InProcessEffectsRunner`.
3. Refactor `PayTransactionUseCase.onApproved` → update APPROVED + publish/run effects.
4. `ApplyPaymentApprovedEffectsUseCase` shared by worker + in-process.
5. `serverless.ts`: queue, DLQ, IAM, `ordersWorker`, env URL.
6. Unit tests.
