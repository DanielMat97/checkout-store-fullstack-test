/**
 * Optional integration against DynamoDB Local.
 * Run: DYNAMODB_ENDPOINT=http://localhost:8000 npm run test -w @app/persistence -- electrodb-product
 */
import { createPersistence } from '../create-persistence';
import { SEED_PRODUCTS } from '../seed/catalog';

const endpoint = process.env.DYNAMODB_ENDPOINT?.trim();
const describeIntegration = endpoint ? describe : describe.skip;

describeIntegration('ElectroDbProductRepository (DynamoDB)', () => {
  const { products } = createPersistence();

  it('puts, gets, lists, and decrements stock', async () => {
    const target = SEED_PRODUCTS[2];
    const put = await products.put(target);
    expect(put.isOk()).toBe(true);

    const got = await products.getById(target.id);
    expect(got.isOk()).toBe(true);
    if (got.isOk()) {
      expect(got.value.name).toBe(target.name);
      expect(got.value.stock).toBe(target.stock);
    }

    const listed = await products.listAll();
    expect(listed.isOk()).toBe(true);
    if (listed.isOk()) {
      expect(listed.value.some((p) => p.id === target.id)).toBe(true);
    }

    const before = got._unsafeUnwrap().stock;
    const dec = await products.decrementStock(target.id, 1);
    expect(dec.isOk()).toBe(true);
    expect(dec._unsafeUnwrap().stock).toBe(before - 1);

    // restore idempotent seed value
    await products.put(target);
  });

  it('returns typed NOT_FOUND for missing product', async () => {
    const result = await products.getById('prod_does_not_exist');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });
});
