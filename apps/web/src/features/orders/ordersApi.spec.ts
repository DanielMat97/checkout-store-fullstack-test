import { setPublicEnv } from '../../publicEnv';
import { fulfillOrderDelivery, loadApprovedOrders, restoreOrderStock } from './ordersApi';

jest.mock('../../mocks/checkoutService', () => ({
  isMockMode: jest.fn(() => false),
}));

import { isMockMode } from '../../mocks/checkoutService';

describe('ordersApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setPublicEnv({
      VITE_API_BASE_URL: 'http://api.test',
      VITE_MOCK_MODE: 'false',
    });
    (isMockMode as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns empty list in mock mode', async () => {
    (isMockMode as jest.Mock).mockReturnValue(true);
    await expect(loadApprovedOrders()).resolves.toEqual([]);
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

  it('keeps product id and null delivery when lookups fail', async () => {
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
                  id: 'tx_2',
                  status: 'APPROVED',
                  productId: 'prod_missing',
                  deliveryId: 'del_missing',
                  customerId: 'c1',
                  productAmount: 1,
                  baseFee: 1,
                  deliveryFee: 1,
                  total: 3,
                  createdAt: '2026-01-01T00:00:00.000Z',
                },
                {
                  id: 'tx_3',
                  status: 'APPROVED',
                  productId: 'prod_2',
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
      return { ok: false, status: 404, text: async () => 'missing' };
    }) as unknown as typeof fetch;

    const rows = await loadApprovedOrders();
    expect(rows[0]).toMatchObject({
      productName: 'prod_missing',
      productStock: null,
      delivery: null,
    });
    expect(rows[1]?.delivery).toBeNull();
  });

  it('restoreOrderStock and fulfillOrderDelivery call API helpers', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          transactionId: 'tx_1',
          productId: 'prod_1',
          stock: 5,
          deliveryStatus: 'CANCELLED',
          transactionStatus: 'REFUNDED',
        }),
    }) as unknown as typeof fetch;

    await expect(restoreOrderStock('tx_1')).resolves.toMatchObject({
      transactionId: 'tx_1',
      stock: 5,
    });

    global.fetch = jest.fn().mockResolvedValue({
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
          status: 'FULFILLED',
        }),
    }) as unknown as typeof fetch;

    await expect(fulfillOrderDelivery('del_1')).resolves.toMatchObject({
      id: 'del_1',
      status: 'FULFILLED',
    });
  });
});
