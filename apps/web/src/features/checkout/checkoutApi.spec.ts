import { setPublicEnv } from '../../publicEnv';
import {
  getMockFees,
  getMockProduct,
  listMockProducts,
  mockPay,
  resetMockStock,
} from '../../mocks/checkoutService';
import { MOCK_PRODUCTS } from '../../mocks/catalog';
import {
  executePay,
  getFees,
  listCatalogProducts,
  loadProduct,
  refreshProductStock,
} from './checkoutApi';

describe('checkoutApi (mock mode)', () => {
  beforeEach(() => {
    setPublicEnv({ VITE_MOCK_MODE: 'true' });
    resetMockStock();
  });

  it('lists catalog and loads product', async () => {
    const items = await listCatalogProducts();
    expect(items.length).toBe(MOCK_PRODUCTS.length);
    expect(await loadProduct(MOCK_PRODUCTS[0].id)).toMatchObject({
      id: MOCK_PRODUCTS[0].id,
    });
    expect(await loadProduct('missing')).toBeNull();
    expect(getFees()).toEqual(getMockFees());
  });

  it('pays approved and declined', async () => {
    const product = getMockProduct(MOCK_PRODUCTS[0].id);
    const delivery = {
      fullName: 'Ada',
      email: 'a@b.co',
      phone: '3001234567',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
    };
    const card = {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada',
    };

    const approved = await executePay({ product, delivery, card });
    expect(approved.status).toBe('APPROVED');
    expect(approved.stock).toBe(product.stock - 1);

    resetMockStock();
    const declined = await executePay({
      product,
      delivery,
      card,
      simulateDecline: true,
    });
    expect(declined.status).toBe('DECLINED');
    expect(await refreshProductStock(product.id)).toBe(product.stock);
  });

  it('mockPay helper covers decline path', async () => {
    const id = MOCK_PRODUCTS[0].id;
    const result = await mockPay({ productId: id, simulateDecline: true });
    expect(result.status).toBe('DECLINED');
    expect(listMockProducts()[0].stock).toBe(MOCK_PRODUCTS[0].stock);
  });
});

describe('checkoutApi (live mode)', () => {
  const product = {
    id: 'prod_a',
    name: 'A',
    kicker: 'k',
    description: 'd',
    priceMinor: 10000,
    stock: 4,
    imageUrl: 'https://example.com/a.jpg',
    imageAlt: 'alt',
  };

  beforeEach(() => {
    setPublicEnv({
      VITE_MOCK_MODE: 'false',
      VITE_BASE_FEE: '1500',
      VITE_DELIVERY_FEE: '5000',
      VITE_API_BASE_URL: 'http://api.test',
    });
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it('executePay creates customer, transaction, and pays', async () => {
    const json = (body: unknown) => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(body),
    });

    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      if (String(url).endsWith('/customers')) {
        return json({
          id: 'cus_1',
          fullName: 'Ada',
          email: 'a@b.co',
          phone: '3001234567',
        });
      }
      if (String(url).endsWith('/transactions')) {
        return json({
          transaction: {
            id: 'txn_1',
            status: 'PENDING',
            productId: product.id,
            customerId: 'cus_1',
            productAmount: product.priceMinor,
            baseFee: 1500,
            deliveryFee: 5000,
            total: 16500,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          deliveryId: 'del_1',
        });
      }
      if (String(url).includes('/pay')) {
        return json({
          paymentStatus: 'APPROVED',
          transaction: {
            id: 'txn_1',
            status: 'APPROVED',
            productId: product.id,
            customerId: 'cus_1',
            productAmount: product.priceMinor,
            baseFee: 1500,
            deliveryFee: 5000,
            total: 16500,
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        });
      }
      if (String(url).includes('/stock')) {
        return json({ productId: product.id, stock: 3 });
      }
      if (String(url).endsWith('/products')) {
        return json({ items: [product] });
      }
      if (String(url).includes('/products/missing')) {
        return {
          ok: false,
          status: 404,
          text: async () => JSON.stringify({ error: 'NOT_FOUND' }),
        };
      }
      return json(product);
    });

    const result = await executePay({
      product,
      delivery: {
        fullName: 'Ada',
        email: 'a@b.co',
        phone: '3001234567',
        address: 'Calle 1',
        city: 'Bogotá',
        region: 'Cundinamarca',
      },
      card: {
        number: '4242 4242 4242 4242',
        cvc: '123',
        expMonth: '12',
        expYear: '30',
        cardHolder: 'Ada',
      },
    });

    expect(result).toEqual({
      transactionId: 'txn_1',
      status: 'APPROVED',
      stock: 3,
    });
    expect(getFees()).toEqual({ baseFee: 1500, deliveryFee: 5000 });
    expect(await listCatalogProducts()).toEqual([product]);
    expect(await loadProduct('prod_a')).toEqual(product);
    expect(await loadProduct('missing')).toBeNull();
  });
});
