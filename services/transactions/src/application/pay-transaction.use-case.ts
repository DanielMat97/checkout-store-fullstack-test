import { Injectable, Inject } from '@nestjs/common';
import { err, errAsync, ok, okAsync, ResultAsync, type Result } from 'neverthrow';
import type { TransactionRepositoryPort } from '@app/persistence';
import { createApplicationLogger } from '@app/shared';
import type { Transaction } from '../domain/transaction';
import { assertPending, type DomainError } from '../domain/errors';
import type { CustomerReaderPort } from '../ports/cross-domain.ports';
import type { CardChargeInput, PaymentGatewayPort } from '../ports/payment-gateway.port';
import type { OrderEventsPublisher } from '../ports/order-events.port';
import {
  CUSTOMER_READER,
  ORDER_EVENTS_PUBLISHER,
  PAYMENT_GATEWAY,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';
import { fromRepoResult } from './result-async';

const payLog = createApplicationLogger('transactions', 'pay_transaction');

export type PayTransactionInput = {
  transactionId: string;
  deliveryId: string;
  card: Omit<CardChargeInput, 'amountMinor' | 'reference' | 'customerEmail'>;
};

export type PayTransactionOutput = {
  transaction: Transaction;
  paymentStatus: 'APPROVED' | 'DECLINED' | 'ERROR';
};

@Injectable()
export class PayTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(CUSTOMER_READER)
    private readonly customers: CustomerReaderPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly payments: PaymentGatewayPort,
    @Inject(ORDER_EVENTS_PUBLISHER)
    private readonly orderEvents: OrderEventsPublisher,
  ) {}

  async execute(
    input: PayTransactionInput,
  ): Promise<Result<PayTransactionOutput, DomainError>> {
    const result = await this.validate(input)
      .andThen((valid) =>
        fromRepoResult(this.transactions.getById(valid.transactionId)).map((tx) => ({
          valid,
          tx,
        })),
      )
      .andThen(({ valid, tx }) => {
        const pendingError = assertPending(tx);
        if (pendingError) return err(pendingError);
        return ok({ valid, tx });
      })
      .andThen(({ valid, tx }) =>
        fromRepoResult(this.customers.getById(tx.customerId)).map((customer) => ({
          valid,
          tx,
          customer,
        })),
      )
      .andThen(({ valid, tx, customer }) =>
        ResultAsync.fromSafePromise(
          this.payments.charge({
            ...valid.card,
            amountMinor: tx.total,
            reference: tx.id,
            customerEmail: customer.email,
          }),
        ).andThen((charge) =>
          charge.isOk() ? ok({ valid, tx, outcome: charge.value }) : err(charge.error),
        ),
      )
      .andThen(({ valid, tx, outcome }) => {
        if (outcome.status === 'APPROVED') {
          return this.onApproved(tx, valid.deliveryId, outcome.providerRef);
        }
        if (outcome.status === 'DECLINED') {
          return this.onTerminal(tx, 'DECLINED', outcome.providerRef);
        }
        return this.onTerminal(tx, 'ERROR', outcome.providerRef);
      });

    if (result.isOk()) {
      payLog.info('pay.outcome', {
        transactionId: result.value.transaction.id,
        paymentStatus: result.value.paymentStatus,
        productId: result.value.transaction.productId,
      });
    } else {
      const failure = result.error;
      payLog.warn('pay.failed', {
        transactionId: input.transactionId,
        errorType: failure.type,
        message: 'message' in failure ? failure.message : undefined,
        entity: 'entity' in failure ? failure.entity : undefined,
        id: 'id' in failure ? failure.id : undefined,
      });
    }

    return result;
  }

  private validate(
    input: PayTransactionInput,
  ): ResultAsync<PayTransactionInput, DomainError> {
    if (!input.transactionId || !input.deliveryId) {
      return errAsync({
        type: 'VALIDATION',
        message: 'transactionId and deliveryId required',
      });
    }
    if (
      !input.card?.number ||
      !input.card?.cvc ||
      !input.card?.expMonth ||
      !input.card?.expYear ||
      !input.card?.cardHolder
    ) {
      return errAsync({ type: 'VALIDATION', message: 'Card fields required' });
    }
    return okAsync(input);
  }

  private onApproved(
    tx: Transaction,
    deliveryId: string,
    providerRef?: string,
  ): ResultAsync<PayTransactionOutput, DomainError> {
    const approved: Transaction = {
      ...tx,
      status: 'APPROVED',
      providerRef,
      deliveryId,
      effectsApplied: false,
    };
    return fromRepoResult(this.transactions.update(approved)).andThen((saved) =>
      ResultAsync.fromSafePromise(
        this.orderEvents.publishPaymentApproved({
          type: 'PaymentApproved',
          transactionId: saved.id,
          deliveryId,
          productId: saved.productId,
          qty: 1,
        }),
      ).andThen(() =>
        fromRepoResult(this.transactions.getById(saved.id))
          .orElse(() => okAsync(saved))
          .map((transaction) => ({
            transaction,
            paymentStatus: 'APPROVED' as const,
          })),
      ),
    );
  }

  private onTerminal(
    tx: Transaction,
    status: 'DECLINED' | 'ERROR',
    providerRef?: string,
  ): ResultAsync<PayTransactionOutput, DomainError> {
    const updated: Transaction = {
      ...tx,
      status,
      providerRef,
    };
    return fromRepoResult(this.transactions.update(updated)).map((saved) => ({
      transaction: saved,
      paymentStatus: status,
    }));
  }
}
