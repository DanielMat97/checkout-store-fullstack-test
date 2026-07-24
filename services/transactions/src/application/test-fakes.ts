import { err, ok, type Result } from 'neverthrow';
import type {
  CustomerRecord,
  DeliveryRecord,
  PersistenceError,
  ProductRecord,
  TransactionRecord,
  CustomerRepositoryPort,
  DeliveryRepositoryPort,
  ProductRepositoryPort,
  TransactionRepositoryPort,
} from '@app/persistence';

export class InMemoryTransactionRepository
  implements TransactionRepositoryPort
{
  private readonly items = new Map<string, TransactionRecord>();

  async getById(
    id: string,
  ): Promise<Result<TransactionRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'transaction', id });
    }
    return ok({ ...item });
  }

  async put(
    tx: TransactionRecord,
  ): Promise<Result<TransactionRecord, PersistenceError>> {
    this.items.set(tx.id, { ...tx });
    return ok({ ...tx });
  }

  async update(
    tx: TransactionRecord,
  ): Promise<Result<TransactionRecord, PersistenceError>> {
    if (!this.items.has(tx.id)) {
      return err({ type: 'NOT_FOUND', entity: 'transaction', id: tx.id });
    }
    this.items.set(tx.id, { ...tx });
    return ok({ ...tx });
  }
}

export class InMemoryProductReader implements ProductRepositoryPort {
  private readonly items = new Map<string, ProductRecord>();
  decrementCalls: Array<{ id: string; qty: number }> = [];

  seed(products: ProductRecord[]): void {
    for (const p of products) {
      this.items.set(p.id, { ...p });
    }
  }

  async getById(
    id: string,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'product', id });
    }
    return ok({ ...item });
  }

  async listAll(): Promise<Result<ProductRecord[], PersistenceError>> {
    return ok([...this.items.values()].map((p) => ({ ...p })));
  }

  async put(
    product: ProductRecord,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    this.items.set(product.id, { ...product });
    return ok({ ...product });
  }

  async updateStock(
    id: string,
    stock: number,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'product', id });
    }
    const next = { ...item, stock };
    this.items.set(id, next);
    return ok({ ...next });
  }

  async decrementStock(
    id: string,
    qty: number,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    this.decrementCalls.push({ id, qty });
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'product', id });
    }
    if (item.stock < qty) {
      return err({
        type: 'INSUFFICIENT_STOCK',
        productId: id,
        stock: item.stock,
        requested: qty,
      });
    }
    return this.updateStock(id, item.stock - qty);
  }
}

export class InMemoryCustomerReader implements CustomerRepositoryPort {
  private readonly items = new Map<string, CustomerRecord>();

  seed(customers: CustomerRecord[]): void {
    for (const c of customers) {
      this.items.set(c.id, { ...c });
    }
  }

  async getById(
    id: string,
  ): Promise<Result<CustomerRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'customer', id });
    }
    return ok({ ...item });
  }

  async put(
    customer: CustomerRecord,
  ): Promise<Result<CustomerRecord, PersistenceError>> {
    this.items.set(customer.id, { ...customer });
    return ok({ ...customer });
  }
}

export class InMemoryDeliveryWriter implements DeliveryRepositoryPort {
  private readonly items = new Map<string, DeliveryRecord>();

  async getById(
    id: string,
  ): Promise<Result<DeliveryRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'delivery', id });
    }
    return ok({ ...item });
  }

  async put(
    delivery: DeliveryRecord,
  ): Promise<Result<DeliveryRecord, PersistenceError>> {
    this.items.set(delivery.id, { ...delivery });
    return ok({ ...delivery });
  }
}
