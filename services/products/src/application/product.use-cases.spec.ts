import { InMemoryProductRepository, SEED_PRODUCTS } from '@app/persistence';
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
});
