import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { Transaction } from '../domain/transaction';
import { assertPending, type DomainError } from '../domain/errors';
import type {
  CustomerReaderPort,
  DeliveryWriterPort,
} from '../ports/cross-domain.ports';
import type { ProductReaderPort } from '../ports/product-reader.port';
import type {
  CardChargeInput,
  PaymentGatewayPort,
} from '../ports/payment-gateway.port';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  PAYMENT_GATEWAY,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../ports/injection.tokens';

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
    @Inject(PRODUCT_READER)
    private readonly products: ProductReaderPort,
    @Inject(DELIVERY_WRITER)
    private readonly deliveries: DeliveryWriterPort,
    @Inject(CUSTOMER_READER)
    private readonly customers: CustomerReaderPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly payments: PaymentGatewayPort,
  ) {}

  async execute(
    input: PayTransactionInput,
  ): Promise<Result<PayTransactionOutput, DomainError>> {
    if (!input.transactionId || !input.deliveryId) {
      return err({
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
      return err({ type: 'VALIDATION', message: 'Card fields required' });
    }

    const loaded = await this.transactions.getById(input.transactionId);
    if (loaded.isErr()) {
      return err(mapPersistence(loaded.error));
    }

    const pendingError = assertPending(loaded.value);
    if (pendingError) {
      return err(pendingError);
    }

    const customer = await this.customers.getById(loaded.value.customerId);
    if (customer.isErr()) {
      return err(mapPersistence(customer.error));
    }

    const charge = await this.payments.charge({
      ...input.card,
      amountMinor: loaded.value.total,
      reference: loaded.value.id,
      customerEmail: customer.value.email,
    });
    if (charge.isErr()) {
      return err(charge.error);
    }

    const outcome = charge.value.status;

    if (outcome === 'APPROVED') {
      return this.onApproved(
        loaded.value,
        input.deliveryId,
        charge.value.providerRef,
      );
    }

    if (outcome === 'DECLINED') {
      return this.onTerminal(loaded.value, 'DECLINED', charge.value.providerRef);
    }

    return this.onTerminal(loaded.value, 'ERROR', charge.value.providerRef);
  }

  private async onApproved(
    tx: Transaction,
    deliveryId: string,
    providerRef?: string,
  ): Promise<Result<PayTransactionOutput, DomainError>> {
    const stock = await this.products.decrementStock(tx.productId, 1);
    if (stock.isErr()) {
      const failed: Transaction = {
        ...tx,
        status: 'ERROR',
        providerRef,
      };
      await this.transactions.update(failed);
      return err(mapPersistence(stock.error));
    }

    const delivery = await this.deliveries.getById(deliveryId);
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

    const approved: Transaction = {
      ...tx,
      status: 'APPROVED',
      providerRef,
    };
    const saved = await this.transactions.update(approved);
    if (saved.isErr()) {
      return err(mapPersistence(saved.error));
    }

    return ok({ transaction: saved.value, paymentStatus: 'APPROVED' });
  }

  private async onTerminal(
    tx: Transaction,
    status: 'DECLINED' | 'ERROR',
    providerRef?: string,
  ): Promise<Result<PayTransactionOutput, DomainError>> {
    const updated: Transaction = {
      ...tx,
      status,
      providerRef,
    };
    const saved = await this.transactions.update(updated);
    if (saved.isErr()) {
      return err(mapPersistence(saved.error));
    }
    return ok({ transaction: saved.value, paymentStatus: status });
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
