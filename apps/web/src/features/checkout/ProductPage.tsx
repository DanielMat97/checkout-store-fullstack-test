import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, type MouseEvent } from 'react';
import {
  AppShell,
  ShellHeader,
  Button,
  Price,
  StockBadge,
  withViewTransition,
} from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { loadProduct, type Product } from './checkoutApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectProduct, setPaymentStatus, setStep } from '../../store/checkoutSlice';
import './product.css';

export function ProductPage({ embed = false }: { embed?: boolean }) {
  const { productId = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stocks = useAppSelector((s) => s.checkout.stocks);
  const lastStatus = useAppSelector((s) => s.checkout.paymentStatus);
  const selectedId = useAppSelector((s) => s.checkout.productId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const loaded = await loadProduct(productId);
      if (cancelled) return;
      if (!loaded) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(loaded);
      if (selectedId !== loaded.id) {
        dispatch(selectProduct(loaded.id));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, selectedId, dispatch, navigate]);

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

  const units = stocks[product.id] ?? product.stock;

  const onPay = () => {
    dispatch(setPaymentStatus('idle'));
    dispatch(setStep('card-delivery'));
    withViewTransition(() => navigate(`/product/${product.id}/checkout`));
  };

  const backHome = (e: MouseEvent) => {
    e.preventDefault();
    withViewTransition(() => navigate('/'));
  };

  return (
    <AppShell layout="store" mockBanner={isMockMode() && !embed}>
      <ShellHeader
        home
        trailing={
          lastStatus === 'APPROVED' && selectedId === product.id ? (
            <span className="nora-product__hint">Stock updated</span>
          ) : (
            <Link className="nora-product__back" to="/" onClick={backHome}>
              Back
            </Link>
          )
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
