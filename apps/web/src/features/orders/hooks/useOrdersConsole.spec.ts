import { act } from 'react';
import { renderHook, waitFor, createTestStore } from '../../../test/renderHook';
import { useOrdersConsole } from './useOrdersConsole';
import * as api from '../ordersApi';

jest.mock('../ordersApi', () => ({
  loadApprovedOrders: jest.fn(),
  restoreOrderStock: jest.fn(),
  fulfillOrderDelivery: jest.fn(),
}));

const row = {
  productName: 'Aura',
  productStock: 2,
  transaction: {
    id: 'tx_1',
    productId: 'prod_a',
    status: 'APPROVED' as const,
  },
  delivery: {
    id: 'del_1',
    status: 'FULFILLABLE' as const,
  },
};

describe('useOrdersConsole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => jest.restoreAllMocks());

  it('loads orders and restores / fulfills', async () => {
    (api.loadApprovedOrders as jest.Mock).mockResolvedValue([row]);
    (api.restoreOrderStock as jest.Mock).mockResolvedValue({
      productId: 'prod_a',
      stock: 3,
    });
    (api.fulfillOrderDelivery as jest.Mock).mockResolvedValue({});
    const { result, unmount } = renderHook(() => useOrdersConsole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toHaveLength(1);

    await act(async () => {
      await result.current.onRestore(row as never);
    });
    expect(api.restoreOrderStock).toHaveBeenCalledWith('tx_1');

    await act(async () => {
      await result.current.onFulfill(row as never);
    });
    expect(api.fulfillOrderDelivery).toHaveBeenCalledWith('del_1');

    act(() => {
      result.current.goShop();
    });
    unmount();
  });

  it('maps load and action errors', async () => {
    (api.loadApprovedOrders as jest.Mock).mockRejectedValue(new Error('down'));
    const { result, unmount } = renderHook(() => useOrdersConsole(), {
      store: createTestStore(),
    });
    await waitFor(() => expect(result.current.error).toMatch(/down/));
    unmount();

    (api.loadApprovedOrders as jest.Mock).mockResolvedValue([row]);
    (api.restoreOrderStock as jest.Mock).mockRejectedValue('x');
    const again = renderHook(() => useOrdersConsole());
    await waitFor(() => expect(again.result.current.loading).toBe(false));
    await act(async () => {
      await again.result.current.onRestore(row as never);
    });
    expect(again.result.current.error).toMatch(/Restore failed/);
    again.unmount();
  });

  it('skips fulfill without delivery id', async () => {
    (api.loadApprovedOrders as jest.Mock).mockResolvedValue([]);
    const { result, unmount } = renderHook(() => useOrdersConsole());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.onFulfill({
        ...row,
        delivery: undefined,
      } as never);
    });
    expect(api.fulfillOrderDelivery).not.toHaveBeenCalled();
    unmount();
  });
});
