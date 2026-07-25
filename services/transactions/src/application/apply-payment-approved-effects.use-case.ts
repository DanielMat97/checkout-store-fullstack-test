import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
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
    const loaded = await this.transactions.getById(event.transactionId);
    if (loaded.isErr()) {
      return err(mapPersistence(loaded.error));
    }
    const tx = loaded.value;

    if (tx.effectsApplied) {
      const delivery = await this.deliveries.getById(event.deliveryId);
      const product = await this.products.getById(event.productId);
      if (delivery.isErr()) return err(mapPersistence(delivery.error));
      if (product.isErr()) return err(mapPersistence(product.error));
      return ok({
        transaction: tx,
        delivery: delivery.value,
        product: product.value,
      });
    }

    if (tx.status !== 'APPROVED') {
      return err({
        type: 'INVALID_STATE',
        message: `Cannot apply effects for status ${tx.status}`,
      });
    }

    const stock = await this.products.decrementStock(event.productId, event.qty);
    if (stock.isErr()) {
      return err(mapPersistence(stock.error));
    }

    const delivery = await this.deliveries.getById(event.deliveryId);
    if (delivery.isErr()) {
      return err(mapPersistence(delivery.error));
    }
    const updatedDelivery = await this.deliveries.put({
      ...delivery.value,
      status: 'FULFILLABLE',
    });
    if (updatedDelivery.isErr()) {
      return err(mapPersistence(updatedDelivery.error));
    }

    const marked = await this.transactions.update({
      ...tx,
      status: 'APPROVED',
      effectsApplied: true,
      deliveryId: event.deliveryId,
    });
    if (marked.isErr()) {
      return err(mapPersistence(marked.error));
    }

    return ok({
      transaction: marked.value,
      delivery: updatedDelivery.value,
      product: stock.value,
    });
  }
}

function mapPersistence(error: {
  type: string;
  entity?: string;
  id?: string;
  message?: string;
  productId?: string;
  stock?: number;
}): DomainError {
  if (error.type === 'NOT_FOUND') {
    return {
      type: 'NOT_FOUND',
      entity: error.entity ?? 'unknown',
      id: error.id ?? '',
    };
  }
  if (error.type === 'INSUFFICIENT_STOCK') {
    return {
      type: 'INSUFFICIENT_STOCK',
      productId: error.productId ?? '',
      stock: error.stock ?? 0,
    };
  }
  return {
    type: 'PERSISTENCE_ERROR',
    message: error.message ?? 'Persistence error',
  };
}
