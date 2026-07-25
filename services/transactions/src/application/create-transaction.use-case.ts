import { Injectable, Inject } from '@nestjs/common';
import { errAsync, okAsync, ResultAsync, type Result } from 'neverthrow';
import { randomUUID } from 'crypto';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { Transaction } from '../domain/transaction';
import { totalOf, type DomainError, type MoneyInput } from '../domain/errors';
import type { CustomerReaderPort, DeliveryWriterPort } from '../ports/cross-domain.ports';
import type { ProductReaderPort } from '../ports/product-reader.port';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';
import { fromRepoResult } from './result-async';

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
    return this.validate(input)
      .andThen((valid) =>
        fromRepoResult(this.products.getById(valid.productId)).andThen((product) => {
          if (product.stock < 1) {
            return errAsync({
              type: 'INSUFFICIENT_STOCK' as const,
              productId: valid.productId,
              stock: product.stock,
            });
          }
          return okAsync(valid);
        }),
      )
      .andThen((valid) =>
        fromRepoResult(this.customers.getById(valid.customerId)).map(() => valid),
      )
      .andThen((valid) => {
        const transactionId = `tx_${randomUUID()}`;
        const deliveryId = `del_${randomUUID()}`;
        const createdAt = new Date().toISOString();
        const transaction: Transaction = {
          id: transactionId,
          status: 'PENDING',
          productId: valid.productId,
          customerId: valid.customerId,
          productAmount: valid.productAmount,
          baseFee: valid.baseFee,
          deliveryFee: valid.deliveryFee,
          total: totalOf(valid),
          createdAt,
          deliveryId,
          effectsApplied: false,
        };

        return fromRepoResult(
          this.deliveries.put({
            id: deliveryId,
            transactionId,
            customerId: valid.customerId,
            address: valid.delivery.address,
            city: valid.delivery.city,
            region: valid.delivery.region,
            feeMinor: valid.deliveryFee,
            status: 'PENDING',
          }),
        ).andThen(() =>
          fromRepoResult(this.transactions.put(transaction)).map((saved) => ({
            transaction: saved,
            deliveryId,
          })),
        );
      });
  }

  private validate(
    input: CreateTransactionInput,
  ): ResultAsync<CreateTransactionInput, DomainError> {
    if (
      !input.productId ||
      !input.customerId ||
      input.productAmount <= 0 ||
      input.baseFee < 0 ||
      input.deliveryFee < 0
    ) {
      return errAsync({ type: 'VALIDATION', message: 'Invalid create payload' });
    }
    if (!input.delivery?.address || !input.delivery?.city || !input.delivery?.region) {
      return errAsync({ type: 'VALIDATION', message: 'Delivery address required' });
    }
    return okAsync(input);
  }
}
