import { SEED_PRODUCTS } from './catalog';

describe('SEED_PRODUCTS', () => {
  it('has at least 3 products with stock > 0', () => {
    expect(SEED_PRODUCTS.length).toBeGreaterThanOrEqual(3);
    expect(SEED_PRODUCTS.every((p) => p.stock > 0)).toBe(true);
  });

  it('uses stable product ids aligned with NORA mock', () => {
    const ids = SEED_PRODUCTS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'prod_aura_quiet',
        'prod_linen_lamp',
        'prod_clay_mug',
        'prod_wool_throw',
      ]),
    );
  });
});
