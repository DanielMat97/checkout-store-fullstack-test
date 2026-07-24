import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Backdrop,
  BrandLockup,
  Button,
  CardBrandMark,
  FeeList,
  withViewTransition,
} from '../../design-system';
import { getProductById } from '../../mocks/catalog';
import { getMockFees, isMockMode, mockPay } from '../../mocks/checkoutService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setPaymentStatus,
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
  const product = productId ? getProductById(productId) : undefined;
  const fees = getMockFees();

  useEffect(() => {
    if (!delivery || !cardMeta || !product) {
      navigate(productId ? `/product/${productId}/checkout` : '/', {
        replace: true,
      });
    }
  }, [delivery, cardMeta, product, productId, navigate]);

  if (!delivery || !cardMeta || !product) return null;

  const total = product.priceMinor + fees.baseFee + fees.deliveryFee;
  const paying = paymentStatus === 'PENDING';

  const onPay = async () => {
    dispatch(setPaymentStatus('PENDING'));
    withViewTransition(() => navigate('/status'));
    if (!isMockMode()) {
      dispatch(setPaymentStatus('ERROR'));
      return;
    }
    const result = await mockPay({
      productId: product.id,
      simulateDecline,
    });
    dispatch(setTransactionId(result.transactionId));
    dispatch(setPaymentStatus(result.status));
    dispatch(setStocks(result.stocks));
    dispatch(setStep('status'));
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
          <Link
            className="nora-summary__back"
            to={`/product/${product.id}/checkout`}
          >
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
