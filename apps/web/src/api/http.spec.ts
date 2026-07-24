import { setPublicEnv } from '../publicEnv';
import { ApiError } from './types';
import { apiBaseUrl, apiFetch } from './http';
import { fetchProduct, fetchProducts, fetchProductStock } from './products';
import { createCustomer, createTransaction, payTransaction } from './checkout';

describe('api http + clients', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setPublicEnv({ VITE_API_BASE_URL: 'http://api.test/' });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('normalizes base url', () => {
    expect(apiBaseUrl()).toBe('http://api.test');
  });

  it('parses successful json', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [{ id: 'p1' }] }),
    }) as unknown as typeof fetch;

    await expect(fetchProducts()).resolves.toEqual([{ id: 'p1' }]);
    expect(fetch).toHaveBeenCalled();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: 'p1' }),
    }) as unknown as typeof fetch;
    await expect(fetchProduct('p1')).resolves.toEqual({ id: 'p1' });
  });

  it('fetches stock and checkout endpoints', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ productId: 'p1', stock: 3, id: 'cus_1' }),
    }) as unknown as typeof fetch;

    await expect(fetchProductStock('p1')).resolves.toMatchObject({ stock: 3 });
    await expect(
      createCustomer({
        fullName: 'Ada',
        email: 'a@b.co',
        phone: '3001234567',
      }),
    ).resolves.toMatchObject({ id: 'cus_1' });
    await expect(
      createTransaction({
        productId: 'p1',
        customerId: 'cus_1',
        productAmount: 1000,
        baseFee: 1500,
        deliveryFee: 5000,
        delivery: { address: 'a', city: 'b', region: 'c' },
      }),
    ).resolves.toBeDefined();
    await expect(
      payTransaction('txn_1', {
        deliveryId: 'del_1',
        card: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '30',
          cardHolder: 'Ada',
        },
      }),
    ).resolves.toBeDefined();
  });

  it('throws ApiError on non-ok and network failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { message: 'bad request' } }),
    }) as unknown as typeof fetch;
    await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiError);

    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(apiFetch('/x')).rejects.toMatchObject({ status: 0 });
  });

  it('handles non-json error bodies', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => 'bad gateway',
    }) as unknown as typeof fetch;
    await expect(apiFetch('/x')).rejects.toMatchObject({
      message: expect.stringMatching(/502|Request failed/i),
    });
  });
});
