import { Injectable, Inject } from '@nestjs/common';
import { errAsync, type Result } from 'neverthrow';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { DomainError } from '../domain/errors';
import type { DeliveryWriterPort } from '../ports/cross-domain.ports';
import type { ProductReaderPort } from '../ports/product-reader.port';
import type {
  PaymentApprovedEvent,
  PaymentApprovedEffects,
} from '../ports/order-events.port';
import {
  DELIVERY_WRITER,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';
import { fromRepoResult } from './result-async';

/**
 * Idempotent side effects after APPROVED: decrement stock + delivery FULFILLABLE.
 */
@Injectable()
export class ApplyPaymentApprovedEffectsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(PRODUCT_READER)
    private readonly products: ProductReaderPort,
    @Inject(DELIVERY_WRITER)
    private readonly deliveries: DeliveryWriterPort,
  ) {}

  async execute(
    event: PaymentApprovedEvent,
  ): Promise<Result<PaymentApprovedEffects, DomainError>> {
    return fromRepoResult(this.transactions.getById(event.transactionId)).andThen(
      (tx) => {
        if (tx.effectsApplied) {
          return fromRepoResult(this.deliveries.getById(event.deliveryId)).andThen(
            (delivery) =>
              fromRepoResult(this.products.getById(event.productId)).map((product) => ({
                transaction: tx,
                delivery,
                product,
              })),
          );
        }

        if (tx.status !== 'APPROVED') {
          return errAsync({
            type: 'INVALID_STATE' as const,
            message: `Cannot apply effects for status ${tx.status}`,
          });
        }

        return fromRepoResult(
          this.products.decrementStock(event.productId, event.qty),
        ).andThen((product) =>
          fromRepoResult(this.deliveries.getById(event.deliveryId)).andThen((delivery) =>
            fromRepoResult(
              this.deliveries.put({
                ...delivery,
                status: 'FULFILLABLE',
              }),
            ).andThen((updatedDelivery) =>
              fromRepoResult(
                this.transactions.update({
                  ...tx,
                  status: 'APPROVED',
                  effectsApplied: true,
                  deliveryId: event.deliveryId,
                }),
              ).map((marked) => ({
                transaction: marked,
                delivery: updatedDelivery,
                product,
              })),
            ),
          ),
        );
      },
    );
  }
}
