import { mapPersistence } from './result-async';

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
    expect(mapPersistence({ type: 'OTHER' })).toEqual({
      type: 'PERSISTENCE_ERROR',
      message: 'Persistence error',
    });
  });
});
