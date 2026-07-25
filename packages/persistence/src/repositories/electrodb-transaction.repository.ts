import { err, ok, type Result } from 'neverthrow';
import type { CheckoutEntities } from '../entities';
import type { PersistenceError, TransactionRecord, TransactionStatus } from '../types';
import type { TransactionRepositoryPort } from '../ports/repositories';

function mapPersistenceError(error: unknown): PersistenceError {
  const message = error instanceof Error ? error.message : String(error);
  return { type: 'PERSISTENCE_ERROR', message };
}

function toRecord(data: {
  transactionId: string;
  status: TransactionRecord['status'];
  productId: string;
  customerId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  providerRef?: string;
  createdAt: string;
  deliveryId?: string;
  effectsApplied?: boolean;
  stockRestoredAt?: string;
}): TransactionRecord {
  return {
    id: data.transactionId,
    status: data.status,
    productId: data.productId,
    customerId: data.customerId,
    productAmount: data.productAmount,
    baseFee: data.baseFee,
    deliveryFee: data.deliveryFee,
    total: data.total,
    providerRef: data.providerRef,
    createdAt: data.createdAt,
    deliveryId: data.deliveryId,
    effectsApplied: data.effectsApplied,
    stockRestoredAt: data.stockRestoredAt,
  };
}

function toEntity(tx: TransactionRecord) {
  return {
    transactionId: tx.id,
    status: tx.status,
    productId: tx.productId,
    customerId: tx.customerId,
    productAmount: tx.productAmount,
    baseFee: tx.baseFee,
    deliveryFee: tx.deliveryFee,
    total: tx.total,
    providerRef: tx.providerRef,
    createdAt: tx.createdAt,
    deliveryId: tx.deliveryId,
    effectsApplied: tx.effectsApplied,
    stockRestoredAt: tx.stockRestoredAt,
  };
}

export class ElectroDbTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly entities: CheckoutEntities) {}

  async getById(id: string): Promise<Result<TransactionRecord, PersistenceError>> {
    try {
      const result = await this.entities.transactions.get({ transactionId: id }).go();
      if (!result.data) {
        return err({ type: 'NOT_FOUND', entity: 'transaction', id });
      }
      return ok(toRecord(result.data));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async put(tx: TransactionRecord): Promise<Result<TransactionRecord, PersistenceError>> {
    try {
      await this.entities.transactions.put(toEntity(tx)).go();
      return ok(tx);
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async update(
    tx: TransactionRecord,
  ): Promise<Result<TransactionRecord, PersistenceError>> {
    try {
      const existing = await this.getById(tx.id);
      if (existing.isErr()) {
        return existing;
      }
      await this.entities.transactions.put(toEntity(tx)).go();
      return ok(tx);
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async listByCreatedAt(options?: {
    status?: TransactionStatus;
    limit?: number;
  }): Promise<Result<TransactionRecord[], PersistenceError>> {
    try {
      const result = await this.entities.transactions.query.byType({}).go({
        order: 'desc',
        pages: 'all',
      });
      let items = result.data.map(toRecord);
      if (options?.status) {
        items = items.filter((t) => t.status === options.status);
      }
      if (options?.limit && options.limit > 0) {
        items = items.slice(0, options.limit);
      }
      return ok(items);
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }
}
