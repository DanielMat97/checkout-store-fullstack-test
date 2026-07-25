import { Link } from 'react-router-dom';
import { AppShell, ShellHeader, Button, Price, StockBadge } from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { useProductPage } from './hooks/useProductPage';
import './product.css';

export function ProductPage({ embed = false }: { embed?: boolean }) {
  const { product, loading, units, lastStatus, selectedId, onPay, backHome } =
    useProductPage();

  if (loading || !product) {
    return (
      <AppShell layout="store" mockBanner={isMockMode() && !embed}>
        <ShellHeader home />
        <main className="nora-product">
          <p className="nora-product__lede">Loading…</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell layout="store" mockBanner={isMockMode() && !embed}>
      <ShellHeader
        home
        trailing={
          <nav className="nora-product__nav" aria-label="Store">
            <Link className="nora-product__nav-link" to="/orders">
              Orders
            </Link>
            {lastStatus === 'APPROVED' && selectedId === product.id ? (
              <span className="nora-product__hint">Stock updated</span>
            ) : (
              <Link className="nora-product__back" to="/" onClick={backHome}>
                Back
              </Link>
            )}
          </nav>
        }
      />

      <main className="nora-product">
        <div className="nora-product__stage">
          <div className="nora-product__hero">
            <img
              className={`nora-vt-product nora-vt-product--${product.id}`}
              src={product.imageUrl}
              alt={product.imageAlt}
              width={1400}
              height={1400}
              decoding="async"
            />
          </div>

          <div className="nora-product__copy">
            <p className="nora-product__kicker nora-reveal">{product.kicker}</p>
            <h1 className="nora-product__title nora-reveal nora-reveal-delay-1">
              {product.name}
            </h1>
            <p className="nora-product__lede nora-reveal nora-reveal-delay-2">
              {product.description}
            </p>
            <div className="nora-product__meta nora-reveal nora-reveal-delay-3">
              <Price minorUnits={product.priceMinor} size="lg" />
              <StockBadge units={units} />
            </div>

            {!embed ? (
              <div className="nora-product__desk-cta nora-reveal nora-reveal-delay-4">
                <Button
                  fullWidth
                  onClick={onPay}
                  disabled={units <= 0}
                  aria-label="Pay with credit card"
                >
                  Pay with credit card
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {!embed ? (
        <div className="nora-product__dock">
          <div className="nora-product__dock-inner">
            <div className="nora-product__dock-info">
              <span className="nora-product__dock-name">{product.name}</span>
              <Price minorUnits={product.priceMinor} size="sm" />
            </div>
            <Button
              onClick={onPay}
              disabled={units <= 0}
              aria-label="Pay with credit card"
            >
              Pay with credit card
            </Button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
