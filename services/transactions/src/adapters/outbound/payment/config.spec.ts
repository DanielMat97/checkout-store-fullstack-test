import { readPaymentGatewayConfig } from './config';

describe('readPaymentGatewayConfig', () => {
  it('reports missing env keys', () => {
    const result = readPaymentGatewayConfig({});
    expect(result).toEqual({
      missing: expect.arrayContaining([
        'PAYMENT_API_URL',
        'PAYMENT_PUBLIC_KEY',
        'PAYMENT_PRIVATE_KEY',
        'PAYMENT_INTEGRITY_KEY',
      ]),
    });
  });

  it('returns config when all keys present', () => {
    const result = readPaymentGatewayConfig({
      PAYMENT_API_URL: 'https://payment.example.test/v1/',
      PAYMENT_PUBLIC_KEY: 'pub_x',
      PAYMENT_PRIVATE_KEY: 'prv_x',
      PAYMENT_INTEGRITY_KEY: 'int_x',
    });
    expect(result).toMatchObject({
      apiUrl: 'https://payment.example.test/v1',
      publicKey: 'pub_x',
      privateKey: 'prv_x',
      integrityKey: 'int_x',
      currency: 'COP',
    });
  });
});
