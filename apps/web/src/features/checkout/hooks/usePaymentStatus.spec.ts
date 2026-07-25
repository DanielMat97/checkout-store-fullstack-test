import { act } from 'react';
import { renderHook, waitFor, createTestStore } from '../../../test/renderHook';
import { usePaymentStatus } from './usePaymentStatus';
import * as api from '../checkoutApi';

jest.mock('../checkoutApi', () => {
  const actual = jest.requireActual('../checkoutApi');
  return {
    ...actual,
    pollProductStockUntilChanged: jest.fn(),
    refreshProductStock: jest.fn(),
  };
});

describe('usePaymentStatus', () => {
  afterEach(() => jest.restoreAllMocks());

  it('builds approved copy and continues with stock refresh', async () => {
    (api.pollProductStockUntilChanged as jest.Mock).mockResolvedValue(2);
    (api.refreshProductStock as jest.Mock).mockResolvedValue(2);
    const store = createTestStore({
      checkout: {
        productId: 'prod_a',
        paymentStatus: 'APPROVED',
        transactionId: 'tx_1',
        paymentError: null,
        stocks: { prod_a: 3 },
        step: 'status',
        delivery: null,
        cardMeta: null,
        simulateDecline: false,
      },
    });
    const { result, unmount } = renderHook(() => usePaymentStatus(), { store });
    expect(result.current.title).toBe('Approved');
    expect(result.current.approved).toBe(true);
    await act(async () => {
      await result.current.onContinue();
    });
    unmount();
  });

  it('maps pending / declined / error copy and retry', async () => {
    const pendingStore = createTestStore({
      checkout: {
        productId: 'prod_a',
        paymentStatus: 'PENDING',
        transactionId: null,
        paymentError: null,
        stocks: {},
        step: 'status',
        delivery: null,
        cardMeta: null,
        simulateDecline: false,
      },
    });
    const pending = renderHook(() => usePaymentStatus(), { store: pendingStore });
    expect(pending.result.current.title).toBe('Confirming');
    pending.unmount();

    const declinedStore = createTestStore({
      checkout: {
        productId: null,
        paymentStatus: 'DECLINED',
        transactionId: null,
        paymentError: null,
        stocks: {},
        step: 'status',
        delivery: null,
        cardMeta: null,
        simulateDecline: false,
      },
    });
    const declined = renderHook(() => usePaymentStatus(), { store: declinedStore });
    expect(declined.result.current.title).toBe('Declined');
    await act(async () => {
      await declined.result.current.onContinue();
    });
    declined.unmount();

    const errorStore = createTestStore({
      checkout: {
        productId: 'prod_a',
        paymentStatus: 'ERROR',
        transactionId: null,
        paymentError: 'boom',
        stocks: {},
        step: 'status',
        delivery: null,
        cardMeta: null,
        simulateDecline: false,
      },
    });
    const errored = renderHook(() => usePaymentStatus(), { store: errorStore });
    expect(errored.result.current.body).toMatch(/boom/);
    act(() => {
      errored.result.current.onRetry();
    });
    errored.unmount();
  });

  it('polls stock on APPROVED mount', async () => {
    (api.pollProductStockUntilChanged as jest.Mock).mockResolvedValue(1);
    const store = createTestStore({
      checkout: {
        productId: 'prod_a',
        paymentStatus: 'APPROVED',
        transactionId: 'tx_1',
        paymentError: null,
        stocks: { prod_a: 2 },
        step: 'status',
        delivery: null,
        cardMeta: null,
        simulateDecline: false,
      },
    });
    const { unmount } = renderHook(() => usePaymentStatus(), { store });
    await waitFor(() => {
      expect(api.pollProductStockUntilChanged).toHaveBeenCalled();
    });
    unmount();
  });
});
