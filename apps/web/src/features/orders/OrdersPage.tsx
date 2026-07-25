import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell, Button, ShellHeader, withViewTransition } from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { useAppDispatch } from '../../store/hooks';
import { setProductStock } from '../../store/checkoutSlice';
import {
  fulfillOrderDelivery,
  loadApprovedOrders,
  restoreOrderStock,
  type OrderRow,
} from './ordersApi';
import './orders.css';

export function OrdersPage() {
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

  return (
    <AppShell layout="store" mockBanner={isMockMode()}>
      <ShellHeader
        home
        trailing={
          <button
            type="button"
            className="nora-orders__nav"
            onClick={() => withViewTransition(() => navigate('/'))}
          >
            Shop
          </button>
        }
      />

      <main className="nora-orders">
        <p className="nora-orders__eyebrow">Store ops · demo</p>
        <h1 className="nora-orders__title">Orders</h1>
        <p className="nora-orders__lede">
          Approved purchases — restore stock or mark fulfilled. No auth (brief demo).
        </p>

        {loading ? <p className="nora-orders__state">Loading…</p> : null}
        {error ? (
          <p className="nora-orders__state nora-orders__state--error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <p className="nora-orders__state">
            {isMockMode()
              ? 'Orders console needs the live API (disable mock mode).'
              : 'No approved purchases yet.'}
          </p>
        ) : null}

        <ul className="nora-orders__list">
          {rows.map((row) => {
            const busy = busyId === row.transaction.id;
            const canFulfill = row.delivery?.status === 'FULFILLABLE';
            return (
              <li key={row.transaction.id} className="nora-orders__row">
                <div className="nora-orders__meta">
                  <p className="nora-orders__product">{row.productName}</p>
                  <p className="nora-orders__id">{row.transaction.id}</p>
                  <p className="nora-orders__hints">
                    Stock {row.productStock ?? '—'}
                    {row.delivery ? ` · Delivery ${row.delivery.status}` : ''}
                  </p>
                </div>
                <div className="nora-orders__actions">
                  <Link
                    className="nora-orders__link"
                    to={`/product/${row.transaction.productId}`}
                  >
                    Product
                  </Link>
                  {canFulfill ? (
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void onFulfill(row)}
                    >
                      Mark fulfilled
                    </Button>
                  ) : null}
                  <Button disabled={busy} onClick={() => void onRestore(row)}>
                    Restore stock
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </AppShell>
  );
}
