import { domainErrorToHttp } from './domain-error.mapper';

describe('domainErrorToHttp', () => {
  it('maps known domain errors to HTTP statuses', () => {
    expect(
      domainErrorToHttp({ type: 'NOT_FOUND', entity: 'product', id: 'x' }).getStatus(),
    ).toBe(404);
    expect(
      domainErrorToHttp({
        type: 'INSUFFICIENT_STOCK',
        productId: 'p',
        stock: 0,
      }).getStatus(),
    ).toBe(409);
    expect(domainErrorToHttp({ type: 'INVALID_STATE', message: 'bad' }).getStatus()).toBe(
      422,
    );
    expect(domainErrorToHttp({ type: 'VALIDATION', message: 'bad' }).getStatus()).toBe(
      400,
    );
    expect(
      domainErrorToHttp({ type: 'PAYMENT_FAILED', message: 'down' }).getStatus(),
    ).toBe(502);
    expect(
      domainErrorToHttp({ type: 'PERSISTENCE_ERROR', message: 'x' }).getStatus(),
    ).toBe(500);
    expect(domainErrorToHttp({ type: 'OTHER', message: 'x' }).getStatus()).toBe(500);
  });

  it('fills defaults for NOT_FOUND and unknown errors without message', () => {
    const missing = domainErrorToHttp({ type: 'NOT_FOUND' } as never);
    expect(missing.getStatus()).toBe(404);
    expect(missing.getResponse()).toMatchObject({
      error: 'NOT_FOUND',
      entity: 'resource',
      id: '',
    });

    const unknown = domainErrorToHttp({ type: 'WEIRD' });
    expect(unknown.getStatus()).toBe(500);
    expect(unknown.getResponse()).toMatchObject({
      error: 'WEIRD',
      message: 'Unexpected error',
    });
  });
});
