import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  ShellHeader,
  Button,
  Price,
  StockBadge,
} from '../../design-system';
import { MOCK_PRODUCT } from '../../mocks/catalog';
import { isMockMode } from '../../mocks/checkoutService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setProductId, setStep, setPaymentStatus } from '../../store/checkoutSlice';
import './product.css';

export function ProductPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stock = useAppSelector((s) => s.checkout.mockStock);
  const lastStatus = useAppSelector((s) => s.checkout.paymentStatus);

  const onPay = () => {
    dispatch(setPaymentStatus('idle'));
    dispatch(setProductId(MOCK_PRODUCT.id));
    dispatch(setStep('card-delivery'));
    navigate('/checkout');
  };

  return (
    <AppShell mockBanner={isMockMode()}>
      <ShellHeader
        trailing={
          lastStatus === 'APPROVED' ? (
            <span className="nora-product__hint">Stock updated</span>
          ) : null
        }
      />
      <main>
        <div className="nora-product__hero">
          <img
            src={MOCK_PRODUCT.imageUrl}
            alt={MOCK_PRODUCT.imageAlt}
            width={800}
            height={1000}
            decoding="async"
          />
        </div>
        <h1 className="nora-product__title">{MOCK_PRODUCT.name}</h1>
        <p className="nora-product__lede">{MOCK_PRODUCT.description}</p>
        <div className="nora-product__meta">
          <Price minorUnits={MOCK_PRODUCT.priceMinor} size="lg" />
          <StockBadge units={stock} />
        </div>
        <Button
          fullWidth
          onClick={onPay}
          disabled={stock <= 0}
          aria-label="Pay with credit card"
        >
          Pay with credit card
        </Button>
      </main>
    </AppShell>
  );
}
