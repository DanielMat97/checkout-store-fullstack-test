import { setPublicEnv } from '../publicEnv';
import { listTransactions, restoreTransaction, markDeliveryFulfilled } from './checkout';

describe('ops checkout API clients', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setPublicEnv({ VITE_API_BASE_URL: 'http://api.test' });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('lists transactions with status filter', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ items: [{ id: 'tx_1', status: 'APPROVED' }] }),
    }) as unknown as typeof fetch;

    await expect(listTransactions({ status: 'APPROVED', limit: 10 })).resolves.toEqual([
      { id: 'tx_1', status: 'APPROVED' },
    ]);
    expect(String((fetch as jest.Mock).mock.calls[0][0])).toContain(
      'status=APPROVED',
    );
  });

  it('restores transaction stock', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          transactionId: 'tx_1',
          productId: 'prod_1',
          stock: 4,
          deliveryStatus: 'CANCELLED',
          transactionStatus: 'REFUNDED',
        }),
    }) as unknown as typeof fetch;

    await expect(restoreTransaction('tx_1')).resolves.toMatchObject({
      transactionStatus: 'REFUNDED',
    });
    expect(String((fetch as jest.Mock).mock.calls[0][0])).toContain('/restore');
  });

  it('marks delivery fulfilled', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: 'del_1', status: 'FULFILLED' }),
    }) as unknown as typeof fetch;

    await expect(markDeliveryFulfilled('del_1')).resolves.toMatchObject({
      status: 'FULFILLED',
    });
  });
});
