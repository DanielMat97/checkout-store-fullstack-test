import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { useAppDispatch } from '../../../store/hooks';
import { setProductStock } from '../../../store/checkoutSlice';
import {
  fulfillOrderDelivery,
  loadApprovedOrders,
  restoreOrderStock,
  type OrderRow,
} from '../ordersApi';

export function useOrdersConsole() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await loadApprovedOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onRestore = async (row: OrderRow) => {
    setBusyId(row.transaction.id);
    try {
      const result = await restoreOrderStock(row.transaction.id);
      dispatch(setProductStock({ productId: result.productId, stock: result.stock }));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed.');
    } finally {
      setBusyId(null);
    }
  };

  const onFulfill = async (row: OrderRow) => {
    if (!row.delivery?.id) return;
    setBusyId(row.transaction.id);
    try {
      await fulfillOrderDelivery(row.delivery.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fulfill failed.');
    } finally {
      setBusyId(null);
    }
  };

  const goShop = () => {
    withViewTransition(() => navigate('/'));
  };

  return {
    rows,
    loading,
    error,
    busyId,
    onRestore,
    onFulfill,
    goShop,
  };
}
