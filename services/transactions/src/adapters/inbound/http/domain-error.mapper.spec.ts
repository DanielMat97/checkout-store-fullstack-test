import { domainErrorToHttp } from './domain-error.mapper';

describe('domainErrorToHttp', () => {
  it('maps each domain error type to an HTTP status', () => {
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
  });
});
