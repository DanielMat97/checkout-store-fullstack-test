import { err, ok } from 'neverthrow';
import { fromRepoResult, mapPersistence } from './result-async';

describe('result-async mapPersistence', () => {
  it('maps NOT_FOUND, INSUFFICIENT_STOCK, and defaults', () => {
    expect(mapPersistence({ type: 'NOT_FOUND' })).toEqual({
      type: 'NOT_FOUND',
      entity: 'unknown',
      id: '',
    });
    expect(
      mapPersistence({
        type: 'INSUFFICIENT_STOCK',
        productId: 'p',
        stock: 2,
      }),
    ).toEqual({ type: 'INSUFFICIENT_STOCK', productId: 'p', stock: 2 });
    expect(mapPersistence({ type: 'INSUFFICIENT_STOCK' })).toEqual({
      type: 'INSUFFICIENT_STOCK',
      productId: '',
      stock: 0,
    });
    expect(mapPersistence({ type: 'OTHER' })).toEqual({
      type: 'PERSISTENCE_ERROR',
      message: 'Persistence error',
    });
  });
});

describe('fromRepoResult', () => {
  it('lifts ok and err repo results onto the domain railway', async () => {
    const good = await fromRepoResult(Promise.resolve(ok({ id: 'x' })));
    expect(good._unsafeUnwrap()).toEqual({ id: 'x' });

    const bad = await fromRepoResult(
      Promise.resolve(err({ type: 'PERSISTENCE_ERROR', message: 'down' })),
    );
    expect(bad._unsafeUnwrapErr()).toEqual({
      type: 'PERSISTENCE_ERROR',
      message: 'down',
    });
  });
});
