import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { DomainError } from '../domain/errors';
import type { DeliveryWriterPort } from '../ports/cross-domain.ports';
import type { ProductReaderPort } from '../ports/product-reader.port';
import {
  DELIVERY_WRITER,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';

export type RestoreTransactionOutput = {
  transactionId: string;
  productId: string;
  stock: number;
  deliveryStatus: string;
  transactionStatus: string;
};

@Injectable()
export class RestoreTransactionStockUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(PRODUCT_READER)
    private readonly products: ProductReaderPort,
    @Inject(DELIVERY_WRITER)
    private readonly deliveries: DeliveryWriterPort,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<RestoreTransactionOutput, DomainError>> {
    if (!transactionId) {
      return err({ type: 'VALIDATION', message: 'transactionId required' });
    }

    const loaded = await this.transactions.getById(transactionId);
    if (loaded.isErr()) {
      return err(mapPersistence(loaded.error));
    }
    const tx = loaded.value;

    if (tx.status !== 'APPROVED') {
      return err({
        type: 'INVALID_STATE',
        message: `Can only restore APPROVED transactions (got ${tx.status})`,
      });
    }
    if (tx.stockRestoredAt) {
      return err({
        type: 'INVALID_STATE',
        message: 'Stock already restored for this transaction',
      });
    }

    const stock = await this.products.incrementStock(tx.productId, 1);
    if (stock.isErr()) {
      return err(mapPersistence(stock.error));
    }

    let deliveryStatus = 'CANCELLED';
    if (tx.deliveryId) {
      const delivery = await this.deliveries.getById(tx.deliveryId);
      if (delivery.isOk() && delivery.value.status !== 'CANCELLED') {
        const cancelled = await this.deliveries.put({
          ...delivery.value,
          status: 'CANCELLED',
        });
        if (cancelled.isErr()) {
          return err(mapPersistence(cancelled.error));
        }
        deliveryStatus = cancelled.value.status;
      } else if (delivery.isOk()) {
        deliveryStatus = delivery.value.status;
      }
    }

    const updated = await this.transactions.update({
      ...tx,
      status: 'REFUNDED',
      stockRestoredAt: new Date().toISOString(),
    });
    if (updated.isErr()) {
      return err(mapPersistence(updated.error));
    }

    return ok({
      transactionId: tx.id,
      productId: tx.productId,
      stock: stock.value.stock,
      deliveryStatus,
      transactionStatus: updated.value.status,
    });
  }
}

function mapPersistence(error: {
  type: string;
  entity?: string;
  id?: string;
  message?: string;
}): DomainError {
  if (error.type === 'NOT_FOUND') {
    return {
      type: 'NOT_FOUND',
      entity: error.entity ?? 'unknown',
      id: error.id ?? '',
    };
  }
  return {
    type: 'PERSISTENCE_ERROR',
    message: error.message ?? 'Persistence error',
  };
}
