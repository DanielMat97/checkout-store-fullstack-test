import type { ApplyPaymentApprovedEffectsUseCase } from '../../../application/apply-payment-approved-effects.use-case';
import type {
  OrderEventsPublisher,
  PaymentApprovedEvent,
} from '../../../ports/order-events.port';

/** Local / offline: apply post-pay effects in the same process. */
export class InProcessOrderEventsPublisher implements OrderEventsPublisher {
  constructor(private readonly applyEffects: ApplyPaymentApprovedEffectsUseCase) {}

  async publishPaymentApproved(event: PaymentApprovedEvent): Promise<void> {
    const result = await this.applyEffects.execute(event);
    if (result.isErr()) {
      const e = result.error;
      const message =
        'message' in e && typeof e.message === 'string'
          ? e.message
          : e.type;
      throw new Error(`InProcess order effects failed: ${message}`);
    }
  }
}
