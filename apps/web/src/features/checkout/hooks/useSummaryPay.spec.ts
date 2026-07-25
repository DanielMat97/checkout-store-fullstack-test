import { act } from 'react';
import { renderHook, waitFor, createTestStore } from '../../../test/renderHook';
import { useSummaryPay } from './useSummaryPay';
import * as api from '../checkoutApi';
import * as cardSession from '../cardSession';
import { ApiError } from '../../../api/types';

jest.mock('../checkoutApi', () => {
  const actual = jest.requireActual('../checkoutApi');
  return { ...actual, loadProduct: jest.fn(), executePay: jest.fn() };
});

jest.mock('../cardSession', () => ({
  takePendingCard: jest.fn(),
}));

jest.mock('../../../mocks/checkoutService', () => ({
  isMockMode: jest.fn(() => false),
}));

const product = {
  id: 'prod_a',
  name: 'Aura',
  kicker: 'k',
  description: 'd',
  priceMinor: 1000,
  stock: 3,
  imageUrl: 'https://example.com/a.jpg',
  imageAlt: 'a',
};

const delivery = {
  fullName: 'Ada',
  email: 'a@b.co',
  phone: '3001112233',
  address: 'Calle 1',
  city: 'Bogotá',
  region: 'Cundinamarca',
};

const cardMeta = { brand: 'visa' as const, last4: '1111', holderName: 'Ada' };

describe('useSummaryPay', () => {
  afterEach(() => jest.restoreAllMocks());

  function storeReady() {
    return createTestStore({
      checkout: {
        productId: 'prod_a',
        delivery,
        cardMeta,
        paymentStatus: 'idle',
      },
    });
  }

  it('loads product and pays successfully', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    (cardSession.takePendingCard as jest.Mock).mockReturnValue({
      number: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada',
    });
    (api.executePay as jest.Mock).mockResolvedValue({
      transactionId: 'tx_1',
      status: 'APPROVED',
      stock: 2,
    });
    const { result, unmount } = renderHook(() => useSummaryPay(), {
      store: storeReady(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      await result.current.onPay();
    });
    expect(api.executePay).toHaveBeenCalled();
    unmount();
  });

  it('errors when card session missing in live mode', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    (cardSession.takePendingCard as jest.Mock).mockReturnValue(null);
    const { result, unmount } = renderHook(() => useSummaryPay(), {
      store: storeReady(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      await result.current.onPay();
    });
    unmount();
  });

  it('maps ApiError on pay failure', async () => {
    (api.loadProduct as jest.Mock).mockResolvedValue(product);
    (cardSession.takePendingCard as jest.Mock).mockReturnValue({
      number: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '30',
      cardHolder: 'Ada',
    });
    (api.executePay as jest.Mock).mockRejectedValue(new ApiError(502, 'pay failed'));
    const { result, unmount } = renderHook(() => useSummaryPay(), {
      store: storeReady(),
    });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      await result.current.onPay();
    });
    act(() => {
      result.current.setDecline(true);
    });
    unmount();
  });
});
