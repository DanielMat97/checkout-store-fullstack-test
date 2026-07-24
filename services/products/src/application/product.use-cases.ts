import { Inject, Injectable } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type { ProductRepositoryPort, ProductRecord } from '@app/persistence';
import { PRODUCT_REPOSITORY } from '../ports/tokens';

export type ProductError =
  { type: 'NOT_FOUND'; id: string } | { type: 'PERSISTENCE_ERROR'; message: string };

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<ProductRecord, ProductError>> {
    if (!id) {
      return err({ type: 'NOT_FOUND', id: '' });
    }
    const result = await this.products.getById(id);
    if (result.isErr()) {
      if (result.error.type === 'NOT_FOUND') {
        return err({ type: 'NOT_FOUND', id });
      }
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          result.error.type === 'PERSISTENCE_ERROR'
            ? result.error.message
            : result.error.type,
      });
    }
    return ok(result.value);
  }
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<ProductRecord[], ProductError>> {
    const result = await this.products.listAll();
    if (result.isErr()) {
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          result.error.type === 'PERSISTENCE_ERROR'
            ? result.error.message
            : result.error.type,
      });
    }
    return ok(result.value);
  }
}
