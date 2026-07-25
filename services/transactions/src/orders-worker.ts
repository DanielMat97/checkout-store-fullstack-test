import type { SQSEvent, SQSHandler } from 'aws-lambda';
import { createPersistence } from '@app/persistence';
import { createLogger } from '@app/shared';
import { ApplyPaymentApprovedEffectsUseCase } from './application/apply-payment-approved-effects.use-case';
import type { PaymentApprovedEvent } from './ports/order-events.port';

const logger = createLogger('orders-worker');

function isPaymentApprovedEvent(value: unknown): value is PaymentApprovedEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    e.type === 'PaymentApproved' &&
    typeof e.transactionId === 'string' &&
    typeof e.deliveryId === 'string' &&
    typeof e.productId === 'string' &&
    typeof e.qty === 'number'
  );
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  const persistence = createPersistence();
  const applyEffects = new ApplyPaymentApprovedEffectsUseCase(
    persistence.transactions,
    persistence.products,
    persistence.deliveries,
  );

  for (const record of event.Records) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(record.body);
    } catch {
      logger.error('orders_worker.invalid_json', { messageId: record.messageId });
      throw new Error(`Invalid JSON in SQS message ${record.messageId}`);
    }

    if (!isPaymentApprovedEvent(parsed)) {
      logger.error('orders_worker.invalid_event', { messageId: record.messageId });
      throw new Error(`Invalid PaymentApproved event ${record.messageId}`);
    }

    const result = await applyEffects.execute(parsed);
    if (result.isErr()) {
      logger.error('orders_worker.apply_failed', {
        messageId: record.messageId,
        transactionId: parsed.transactionId,
        error: result.error,
      });
      throw new Error(
        `Apply effects failed for ${parsed.transactionId}: ${result.error.type}`,
      );
    }

    logger.info('orders_worker.applied', {
      transactionId: parsed.transactionId,
      effectsApplied: result.value.transaction.effectsApplied,
    });
  }
};
