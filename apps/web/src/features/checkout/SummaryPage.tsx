import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Backdrop,
  BrandLockup,
  Button,
  CardBrandMark,
  FeeList,
  withViewTransition,
} from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { takePendingCard } from './cardSession';
import { executePay, getFees, loadProduct, type Product } from './checkoutApi';
import { ApiError } from '../../api/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setPaymentError,
  setPaymentStatus,
  setProductStock,
  setSimulateDecline,
  setStep,
  setStocks,
  setTransactionId,
} from '../../store/checkoutSlice';
import './summary.css';

export function SummaryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const delivery = useAppSelector((s) => s.checkout.delivery);
  const cardMeta = useAppSelector((s) => s.checkout.cardMeta);
  const productId = useAppSelector((s) => s.checkout.productId);
  const simulateDecline = useAppSelector((s) => s.checkout.simulateDecline);
  const paymentStatus = useAppSelector((s) => s.checkout.paymentStatus);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!delivery || !cardMeta) {
      navigate(productId ? `/product/${productId}/checkout` : '/', {
        replace: true,
      });
      return;
    }
    let cancelled = false;
    (async () => {
      if (!productId) {
        navigate('/', { replace: true });
        return;
      }
      const loaded = await loadProduct(productId);
      if (cancelled) return;
      if (!loaded) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [delivery, cardMeta, productId, navigate]);

  if (!delivery || !cardMeta || !product) return null;

  const fees = getFees();
  const total = product.priceMinor + fees.baseFee + fees.deliveryFee;
  const paying = paymentStatus === 'PENDING';

  const onPay = async () => {
    const card = takePendingCard();
    if (!isMockMode() && !card) {
      dispatch(setPaymentError('Card details expired. Please re-enter your card.'));
      dispatch(setPaymentStatus('ERROR'));
      withViewTransition(() => navigate('/status'));
      return;
    }

    dispatch(setPaymentError(null));
    dispatch(setPaymentStatus('PENDING'));
    withViewTransition(() => navigate('/status'));

    try {
      const result = await executePay({
        product,
        delivery,
        card: card ?? {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '30',
          cardHolder: cardMeta.holderName,
        },
        simulateDecline,
      });
      dispatch(setTransactionId(result.transactionId));
      dispatch(setPaymentStatus(result.status));
      if (result.stocks) {
        dispatch(setStocks(result.stocks));
      } else {
        dispatch(setProductStock({ productId: product.id, stock: result.stock }));
      }
      dispatch(setStep('status'));
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Payment failed';
      dispatch(setPaymentError(message));
      dispatch(setPaymentStatus('ERROR'));
      dispatch(setStep('status'));
    }
  };

  return (
    <Backdrop
      title="Summary"
      footer={
        <>
          {isMockMode() ? (
            <label className="nora-summary__toggle">
              <input
                type="checkbox"
                checked={simulateDecline}
                onChange={(e) => dispatch(setSimulateDecline(e.target.checked))}
              />
              Simulate decline
            </label>
          ) : null}
          <Button fullWidth onClick={onPay} disabled={paying}>
            {paying ? 'Processing…' : 'Pay now'}
          </Button>
          <Link className="nora-summary__back" to={`/product/${product.id}/checkout`}>
            Edit details
          </Link>
        </>
      }
    >
      <BrandLockup size="sm" />
      <p className="nora-summary__product">{product.name}</p>
      <FeeList
        lines={[
          { label: 'Product', amountMinor: product.priceMinor },
          { label: 'Base fee', amountMinor: fees.baseFee },
          { label: 'Delivery', amountMinor: fees.deliveryFee },
          { label: 'Total', amountMinor: total, emphasis: true },
        ]}
      />
      <div className="nora-summary__meta">
        <div className="nora-summary__card">
          <CardBrandMark brand={cardMeta.brand} />
          <span>•••• {cardMeta.last4}</span>
          <span>{cardMeta.holderName}</span>
        </div>
        <p>
          Deliver to {delivery.fullName}
          <br />
          {delivery.address}
          <br />
          {delivery.city}, {delivery.region}
        </p>
      </div>
    </Backdrop>
  );
}
