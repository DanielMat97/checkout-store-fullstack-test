import { InMemoryProductRepository, SEED_PRODUCTS } from '@app/persistence';
import { err } from 'neverthrow';
import { GetProductUseCase, ListProductsUseCase } from './product.use-cases';

describe('Product use-cases (ROP)', () => {
  const repo = new InMemoryProductRepository();
  const getProduct = new GetProductUseCase(repo);
  const listProducts = new ListProductsUseCase(repo);

  beforeEach(() => {
    repo.seed(SEED_PRODUCTS);
  });

  it('lists seeded products', async () => {
    const result = await listProducts.execute();
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('gets product by id', async () => {
    const result = await getProduct.execute('prod_aura_quiet');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.name).toBe('Aura Quiet');
    }
  });

  it('returns typed NOT_FOUND', async () => {
    const result = await getProduct.execute('nope');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });

  it('maps empty id and persistence failures', async () => {
    expect((await getProduct.execute(''))._unsafeUnwrapErr().type).toBe('NOT_FOUND');

    const failing = {
      getById: async () => err({ type: 'PERSISTENCE_ERROR' as const, message: 'down' }),
      listAll: async () =>
        err({
          type: 'INSUFFICIENT_STOCK' as const,
          productId: 'p',
          stock: 0,
          requested: 1,
        }),
      put: async () => err({ type: 'PERSISTENCE_ERROR' as const, message: 'x' }),
      updateStock: async () => err({ type: 'PERSISTENCE_ERROR' as const, message: 'x' }),
      decrementStock: async () =>
        err({ type: 'PERSISTENCE_ERROR' as const, message: 'x' }),
    };
    const getFail = new GetProductUseCase(failing as never);
    const listFail = new ListProductsUseCase(failing as never);
    expect((await getFail.execute('p'))._unsafeUnwrapErr().type).toBe(
      'PERSISTENCE_ERROR',
    );
    expect((await listFail.execute())._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');

    const weirdGet = {
      ...failing,
      getById: async () =>
        err({
          type: 'INSUFFICIENT_STOCK' as const,
          productId: 'p',
          stock: 0,
          requested: 1,
        }),
      listAll: async () => err({ type: 'PERSISTENCE_ERROR' as const, message: 'list' }),
    };
    const weirdResult = await new GetProductUseCase(weirdGet as never).execute('p');
    expect(weirdResult.isErr() && weirdResult.error.type).toBe('PERSISTENCE_ERROR');
    if (weirdResult.isErr() && weirdResult.error.type === 'PERSISTENCE_ERROR') {
      expect(weirdResult.error.message).toBe('INSUFFICIENT_STOCK');
    }
    const listWeird = await new ListProductsUseCase(weirdGet as never).execute();
    expect(listWeird.isErr() && listWeird.error.type).toBe('PERSISTENCE_ERROR');
    if (listWeird.isErr() && listWeird.error.type === 'PERSISTENCE_ERROR') {
      expect(listWeird.error.message).toBe('list');
    }
  });
});
