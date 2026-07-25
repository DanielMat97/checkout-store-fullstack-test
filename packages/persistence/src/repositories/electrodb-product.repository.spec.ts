import { ElectroDbProductRepository } from './electrodb-product.repository';

function chainGo<T>(data: T) {
  return { go: jest.fn().mockResolvedValue({ data }) };
}

describe('ElectroDbProductRepository', () => {
  const productRow = {
    productId: 'prod_a',
    name: 'A',
    kicker: 'k',
    description: 'd',
    priceMinor: 1000,
    stock: 5,
    imageUrl: 'https://example.com/a.jpg',
    imageAlt: 'alt',
  };

  it('getById / listAll / put / updateStock / decrementStock happy paths', async () => {
    const entities = {
      products: {
        get: jest.fn().mockReturnValue(chainGo(productRow)),
        query: { byType: jest.fn().mockReturnValue(chainGo([productRow])) },
        put: jest.fn().mockReturnValue(chainGo(productRow)),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue(chainGo({ ...productRow, stock: 4 })),
        }),
      },
    };
    const repo = new ElectroDbProductRepository(entities as never);

    await expect(repo.getById('prod_a')).resolves.toMatchObject({
      value: { id: 'prod_a', stock: 5 },
    });
    await expect(repo.listAll()).resolves.toMatchObject({
      value: [{ id: 'prod_a' }],
    });
    await expect(
      repo.put({
        id: 'prod_a',
        name: 'A',
        kicker: 'k',
        description: 'd',
        priceMinor: 1000,
        stock: 5,
        imageUrl: productRow.imageUrl,
        imageAlt: 'alt',
      }),
    ).resolves.toMatchObject({ value: { id: 'prod_a' } });
    await expect(repo.updateStock('prod_a', 4)).resolves.toMatchObject({
      value: { stock: 4 },
    });
    await expect(repo.decrementStock('prod_a', 1)).resolves.toMatchObject({
      value: { stock: 4 },
    });
  });

  it('maps NOT_FOUND, INSUFFICIENT_STOCK, and persistence errors', async () => {
    const entities = {
      products: {
        get: jest
          .fn()
          .mockReturnValueOnce(chainGo(null))
          .mockReturnValueOnce({
            go: jest.fn().mockRejectedValue(new Error('boom')),
          })
          .mockReturnValue(chainGo({ ...productRow, stock: 0 })),
        query: {
          byType: jest.fn().mockReturnValue({
            go: jest.fn().mockRejectedValue('fail-list'),
          }),
        },
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockRejectedValue(new Error('put-fail')),
        }),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue(chainGo(null)),
        }),
      },
    };
    const repo = new ElectroDbProductRepository(entities as never);

    const missing = await repo.getById('x');
    expect(missing.isErr() && missing.error.type).toBe('NOT_FOUND');

    const boom = await repo.getById('x');
    expect(boom.isErr() && boom.error.type).toBe('PERSISTENCE_ERROR');

    const listed = await repo.listAll();
    expect(listed.isErr() && listed.error.type).toBe('PERSISTENCE_ERROR');

    const put = await repo.put({
      id: 'prod_a',
      name: 'A',
      kicker: 'k',
      description: 'd',
      priceMinor: 1000,
      stock: 5,
      imageUrl: productRow.imageUrl,
      imageAlt: 'alt',
    });
    expect(put.isErr() && put.error.type).toBe('PERSISTENCE_ERROR');

    const low = await repo.decrementStock('prod_a', 2);
    expect(low.isErr() && low.error.type).toBe('INSUFFICIENT_STOCK');

    // get ok then update returns null data
    entities.products.get.mockReturnValue(chainGo(productRow));
    const updated = await repo.updateStock('prod_a', 1);
    expect(updated.isErr() && updated.error.type).toBe('NOT_FOUND');
  });

  it('incrementStock happy path and guards', async () => {
    const entities = {
      products: {
        get: jest
          .fn()
          .mockReturnValueOnce(chainGo(productRow))
          .mockReturnValueOnce(chainGo({ ...productRow, stock: 6 }))
          .mockReturnValueOnce(chainGo(null))
          .mockReturnValueOnce(chainGo(productRow)),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue(chainGo({ ...productRow, stock: 6 })),
        }),
        query: { byType: jest.fn() },
        put: jest.fn(),
      },
    };
    const repo = new ElectroDbProductRepository(entities as never);

    await expect(repo.incrementStock('prod_a', 1)).resolves.toMatchObject({
      value: { stock: 6 },
    });

    const missing = await repo.incrementStock('missing', 1);
    expect(missing.isErr() && missing.error.type).toBe('NOT_FOUND');

    const badQty = await repo.incrementStock('prod_a', 0);
    expect(badQty.isErr() && badQty.error.type).toBe('PERSISTENCE_ERROR');
  });

  it('propagates getById errors from updateStock and decrementStock', async () => {
    const entities = {
      products: {
        get: jest.fn().mockReturnValue(chainGo(null)),
        update: jest.fn(),
        query: { byType: jest.fn() },
        put: jest.fn(),
      },
    };
    const repo = new ElectroDbProductRepository(entities as never);
    expect((await repo.updateStock('x', 1))._unsafeUnwrapErr().type).toBe('NOT_FOUND');
    expect((await repo.decrementStock('x', 1))._unsafeUnwrapErr().type).toBe('NOT_FOUND');
  });

  it('maps updateStock throw to PERSISTENCE_ERROR', async () => {
    const entities = {
      products: {
        get: jest.fn().mockReturnValue(chainGo(productRow)),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            go: jest.fn().mockRejectedValue(new Error('upd')),
          }),
        }),
        query: { byType: jest.fn() },
        put: jest.fn(),
      },
    };
    const repo = new ElectroDbProductRepository(entities as never);
    expect((await repo.updateStock('prod_a', 1))._unsafeUnwrapErr().type).toBe(
      'PERSISTENCE_ERROR',
    );
  });
});
