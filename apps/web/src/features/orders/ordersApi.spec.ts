import { setPublicEnv } from '../../publicEnv';
import { loadApprovedOrders } from './ordersApi';

describe('ordersApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setPublicEnv({
      VITE_API_BASE_URL: 'http://api.test',
      VITE_MOCK_MODE: 'false',
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads approved orders with product and delivery', async () => {
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      const path = String(url);
      if (path.includes('/transactions')) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              items: [
                {
                  id: 'tx_1',
                  status: 'APPROVED',
                  productId: 'prod_1',
                  deliveryId: 'del_1',
                  customerId: 'c1',
                  productAmount: 1,
                  baseFee: 1,
                  deliveryFee: 1,
                  total: 3,
                  createdAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            }),
        };
      }
      if (path.includes('/products/')) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              id: 'prod_1',
              name: 'Aura Quiet',
              kicker: 'k',
              description: 'd',
              priceMinor: 1000,
              stock: 4,
              imageUrl: 'https://example.com/a.jpg',
              imageAlt: 'a',
            }),
        };
      }
      if (path.includes('/deliveries/')) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              id: 'del_1',
              transactionId: 'tx_1',
              customerId: 'c1',
              address: 'a',
              city: 'c',
              region: 'r',
              feeMinor: 5000,
              status: 'FULFILLABLE',
            }),
        };
      }
      return { ok: false, status: 404, text: async () => '' };
    }) as unknown as typeof fetch;

    const rows = await loadApprovedOrders();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.productName).toBe('Aura Quiet');
    expect(rows[0]?.delivery?.status).toBe('FULFILLABLE');
  });
});
