import type { Result } from 'neverthrow';
import type { DomainError } from '../domain/errors';

export type CardChargeInput = {
  amountMinor: number;
  reference: string;
  customerEmail: string;
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
};

export type ChargeOutcome = {
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  providerRef?: string;
  message?: string;
};

export interface PaymentGatewayPort {
  charge(input: CardChargeInput): Promise<Result<ChargeOutcome, DomainError>>;
}
