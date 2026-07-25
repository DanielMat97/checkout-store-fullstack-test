import { Link } from 'react-router-dom';
import { AppShell, Button, ShellHeader } from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { useOrdersConsole } from './hooks/useOrdersConsole';
import './orders.css';

export function OrdersPage() {
  const { rows, loading, error, busyId, onRestore, onFulfill, goShop } =
    useOrdersConsole();

  return (
    <AppShell layout="store" mockBanner={isMockMode()}>
      <ShellHeader
        home
        trailing={
          <button type="button" className="nora-orders__nav" onClick={goShop}>
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
