import { err, ok, type Result } from 'neverthrow';
import type { CheckoutEntities } from '../entities';
import type { PersistenceError, ProductRecord } from '../types';
import type { ProductRepositoryPort } from '../ports/repositories';

function mapPersistenceError(error: unknown): PersistenceError {
  const message = error instanceof Error ? error.message : String(error);
  return { type: 'PERSISTENCE_ERROR', message };
}

function toRecord(item: {
  productId: string;
  name: string;
  kicker: string;
  description: string;
  priceMinor: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
}): ProductRecord {
  return {
    id: item.productId,
    name: item.name,
    kicker: item.kicker,
    description: item.description,
    priceMinor: item.priceMinor,
    stock: item.stock,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
  };
}

export class ElectroDbProductRepository implements ProductRepositoryPort {
  constructor(private readonly entities: CheckoutEntities) {}

  async getById(id: string): Promise<Result<ProductRecord, PersistenceError>> {
    try {
      const result = await this.entities.products.get({ productId: id }).go();
      if (!result.data) {
        return err({ type: 'NOT_FOUND', entity: 'product', id });
      }
      return ok(toRecord(result.data));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async listAll(): Promise<Result<ProductRecord[], PersistenceError>> {
    try {
      const result = await this.entities.products.query.byType({}).go();
      return ok(result.data.map(toRecord));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async put(product: ProductRecord): Promise<Result<ProductRecord, PersistenceError>> {
    try {
      const result = await this.entities.products
        .put({
          productId: product.id,
          name: product.name,
          kicker: product.kicker,
          description: product.description,
          priceMinor: product.priceMinor,
          stock: product.stock,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
        })
        .go();
      return ok(toRecord(result.data));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async updateStock(
    id: string,
    stock: number,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    try {
      const existing = await this.getById(id);
      if (existing.isErr()) {
        return existing;
      }
      const result = await this.entities.products
        .update({ productId: id })
        .set({ stock })
        .go({ response: 'all_new' });
      if (!result.data) {
        return err({ type: 'NOT_FOUND', entity: 'product', id });
      }
      return ok(toRecord(result.data as Parameters<typeof toRecord>[0]));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async decrementStock(
    id: string,
    qty: number,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    const current = await this.getById(id);
    if (current.isErr()) {
      return current;
    }
    if (current.value.stock < qty) {
      return err({
        type: 'INSUFFICIENT_STOCK',
        productId: id,
        stock: current.value.stock,
        requested: qty,
      });
    }
    return this.updateStock(id, current.value.stock - qty);
  }

  async incrementStock(
    id: string,
    qty: number,
  ): Promise<Result<ProductRecord, PersistenceError>> {
    const current = await this.getById(id);
    if (current.isErr()) {
      return current;
    }
    if (qty < 1) {
      return err({
        type: 'PERSISTENCE_ERROR',
        message: 'increment qty must be >= 1',
      });
    }
    return this.updateStock(id, current.value.stock + qty);
  }
}
