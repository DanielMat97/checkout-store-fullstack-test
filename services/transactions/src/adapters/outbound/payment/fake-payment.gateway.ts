import { err, ok, type Result } from 'neverthrow';
import type { DomainError } from '../../../domain/errors';
import type {
  CardChargeInput,
  ChargeOutcome,
  PaymentGatewayPort,
} from '../../../ports/payment-gateway.port';

export type FakeGatewayMode = 'APPROVED' | 'DECLINED' | 'ERROR';

/**
 * Deterministic gateway for unit tests / local PAYMENT_GATEWAY_MODE=fake.
 * Never logs card fields.
 */
export class FakePaymentGateway implements PaymentGatewayPort {
  constructor(private readonly mode: FakeGatewayMode = 'APPROVED') {}

  async charge(
    input: CardChargeInput,
  ): Promise<Result<ChargeOutcome, DomainError>> {
    if (!input.reference || input.amountMinor <= 0) {
      return err({
        type: 'VALIDATION',
        message: 'Invalid charge input',
      });
    }

    if (this.mode === 'ERROR') {
      return ok({
        status: 'ERROR',
        message: 'Simulated provider error',
      });
    }

    if (this.mode === 'DECLINED') {
      return ok({
        status: 'DECLINED',
        providerRef: `fake_declined_${input.reference}`,
        message: 'Simulated decline',
      });
    }

    return ok({
      status: 'APPROVED',
      providerRef: `fake_approved_${input.reference}`,
    });
  }
}
