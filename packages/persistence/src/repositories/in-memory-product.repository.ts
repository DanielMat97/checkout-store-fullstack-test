import { err, ok, type Result } from 'neverthrow';
import type { PersistenceError, ProductRecord } from '../types';
import type { ProductRepositoryPort } from '../ports/repositories';

/** Test double — same port contract as ElectroDB adapter. */
export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly items = new Map<string, ProductRecord>();

  seed(products: ProductRecord[]): void {
    for (const product of products) {
      this.items.set(product.id, { ...product });
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
