import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import { randomUUID } from 'crypto';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { Transaction } from '../domain/transaction';
import { totalOf, type DomainError, type MoneyInput } from '../domain/errors';
import type { CustomerReaderPort } from '../ports/cross-domain.ports';
import type { ProductReaderPort } from '../ports/product-reader.port';
import type { DeliveryWriterPort } from '../ports/cross-domain.ports';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';

export type CreateTransactionInput = MoneyInput & {
  productId: string;
  customerId: string;
  delivery: {
    address: string;
    city: string;
    region: string;
  };
};

export type CreateTransactionOutput = {
  transaction: Transaction;
  deliveryId: string;
};

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
    @Inject(PRODUCT_READER)
    private readonly products: ProductReaderPort,
    @Inject(CUSTOMER_READER)
    private readonly customers: CustomerReaderPort,
    @Inject(DELIVERY_WRITER)
    private readonly deliveries: DeliveryWriterPort,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<CreateTransactionOutput, DomainError>> {
    if (
      !input.productId ||
      !input.customerId ||
      input.productAmount <= 0 ||
      input.baseFee < 0 ||
      input.deliveryFee < 0
    ) {
      return err({ type: 'VALIDATION', message: 'Invalid create payload' });
    }
    if (!input.delivery?.address || !input.delivery?.city || !input.delivery?.region) {
      return err({ type: 'VALIDATION', message: 'Delivery address required' });
    }

    const product = await this.products.getById(input.productId);
    if (product.isErr()) {
      return err(mapPersistence(product.error));
    }
    if (product.value.stock < 1) {
      return err({
        type: 'INSUFFICIENT_STOCK',
        productId: input.productId,
        stock: product.value.stock,
      });
    }

    const customer = await this.customers.getById(input.customerId);
    if (customer.isErr()) {
      return err(mapPersistence(customer.error));
    }

    const transactionId = `tx_${randomUUID()}`;
    const deliveryId = `del_${randomUUID()}`;
    const createdAt = new Date().toISOString();
    const transaction: Transaction = {
      id: transactionId,
      status: 'PENDING',
      productId: input.productId,
      customerId: input.customerId,
      productAmount: input.productAmount,
      baseFee: input.baseFee,
      deliveryFee: input.deliveryFee,
      total: totalOf(input),
      createdAt,
    };

    const saved = await this.transactions.put(transaction);
    if (saved.isErr()) {
      return err(mapPersistence(saved.error));
    }

    const delivery = await this.deliveries.put({
      id: deliveryId,
      transactionId,
      customerId: input.customerId,
      address: input.delivery.address,
      city: input.delivery.city,
      region: input.delivery.region,
      feeMinor: input.deliveryFee,
      status: 'PENDING',
    });
    if (delivery.isErr()) {
      return err(mapPersistence(delivery.error));
    }

    return ok({ transaction: saved.value, deliveryId });
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
