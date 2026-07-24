import { InMemoryProductRepository } from './in-memory-product.repository';
import { SEED_PRODUCTS } from '../seed/catalog';

describe('InMemoryProductRepository (port contract)', () => {
  const repo = new InMemoryProductRepository();

  beforeEach(() => {
    repo.seed(SEED_PRODUCTS);
  });

  it('lists ≥3 products with stock > 0 after seed', async () => {
    const result = await repo.listAll();
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBeGreaterThanOrEqual(3);
      expect(result.value.every((p) => p.stock > 0)).toBe(true);
    }
  });

  it('gets product by id with catalog fields', async () => {
    const result = await repo.getById('prod_aura_quiet');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toMatchObject({
        id: 'prod_aura_quiet',
        name: 'Aura Quiet',
        priceMinor: 45990000,
        stock: 8,
      });
      expect(result.value.imageUrl).toBeTruthy();
      expect(result.value.description).toBeTruthy();
    }
  });

  it('returns typed NOT_FOUND when product missing', async () => {
    const result = await repo.getById('missing');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({
        type: 'NOT_FOUND',
        entity: 'product',
        id: 'missing',
      });
    }
  });

  it('decrements stock and persists new value', async () => {
    const dec = await repo.decrementStock('prod_clay_mug', 2);
    expect(dec.isOk()).toBe(true);
    if (dec.isOk()) {
      expect(dec.value.stock).toBe(22);
    }
    const again = await repo.getById('prod_clay_mug');
    expect(again._unsafeUnwrap().stock).toBe(22);
  });

  it('returns INSUFFICIENT_STOCK when qty exceeds stock', async () => {
    const result = await repo.decrementStock('prod_wool_throw', 100);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('INSUFFICIENT_STOCK');
    }
  });

  it('put is idempotent for fixed product ids', async () => {
    const first = await repo.put(SEED_PRODUCTS[0]);
    const second = await repo.put({ ...SEED_PRODUCTS[0], stock: 99 });
    expect(first.isOk()).toBe(true);
    expect(second.isOk()).toBe(true);
    const got = await repo.getById('prod_aura_quiet');
    expect(got._unsafeUnwrap().stock).toBe(99);
  });
});
