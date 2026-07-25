import type { Result } from 'neverthrow';
import type {
  CustomerRecord,
  DeliveryRecord,
  PersistenceError,
  ProductRecord,
  TransactionRecord,
  TransactionStatus,
} from '../types';

export interface ProductRepositoryPort {
  getById(id: string): Promise<Result<ProductRecord, PersistenceError>>;
  listAll(): Promise<Result<ProductRecord[], PersistenceError>>;
  put(product: ProductRecord): Promise<Result<ProductRecord, PersistenceError>>;
  updateStock(
    id: string,
    stock: number,
  ): Promise<Result<ProductRecord, PersistenceError>>;
  decrementStock(
    id: string,
    qty: number,
  ): Promise<Result<ProductRecord, PersistenceError>>;
  incrementStock(
    id: string,
    qty: number,
  ): Promise<Result<ProductRecord, PersistenceError>>;
}

export interface CustomerRepositoryPort {
  getById(id: string): Promise<Result<CustomerRecord, PersistenceError>>;
  put(customer: CustomerRecord): Promise<Result<CustomerRecord, PersistenceError>>;
}

export interface DeliveryRepositoryPort {
  getById(id: string): Promise<Result<DeliveryRecord, PersistenceError>>;
  put(delivery: DeliveryRecord): Promise<Result<DeliveryRecord, PersistenceError>>;
  listByTransaction(
    transactionId: string,
  ): Promise<Result<DeliveryRecord[], PersistenceError>>;
}

export interface TransactionRepositoryPort {
  getById(id: string): Promise<Result<TransactionRecord, PersistenceError>>;
  put(tx: TransactionRecord): Promise<Result<TransactionRecord, PersistenceError>>;
  update(tx: TransactionRecord): Promise<Result<TransactionRecord, PersistenceError>>;
  listByCreatedAt(options?: {
    status?: TransactionStatus;
    limit?: number;
  }): Promise<Result<TransactionRecord[], PersistenceError>>;
}
