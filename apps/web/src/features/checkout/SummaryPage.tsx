import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Backdrop,
  BrandLockup,
  Button,
  CardBrandMark,
  FeeList,
} from '../../design-system';
import { MOCK_PRODUCT } from '../../mocks/catalog';
import { getMockFees, isMockMode, mockPay } from '../../mocks/checkoutService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setMockStock,
  setPaymentStatus,
  setSimulateDecline,
  setStep,
  setTransactionId,
} from '../../store/checkoutSlice';
import './summary.css';

export function SummaryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const delivery = useAppSelector((s) => s.checkout.delivery);
  const cardMeta = useAppSelector((s) => s.checkout.cardMeta);
  const simulateDecline = useAppSelector((s) => s.checkout.simulateDecline);
  const paymentStatus = useAppSelector((s) => s.checkout.paymentStatus);
  const fees = getMockFees();

  useEffect(() => {
    if (!delivery || !cardMeta) {
      navigate('/checkout', { replace: true });
    }
  }, [delivery, cardMeta, navigate]);

  if (!delivery || !cardMeta) return null;

  const total =
    MOCK_PRODUCT.priceMinor + fees.baseFee + fees.deliveryFee;
  const paying = paymentStatus === 'PENDING';

  const onPay = async () => {
    dispatch(setPaymentStatus('PENDING'));
    navigate('/status');
    if (!isMockMode()) {
      dispatch(setPaymentStatus('ERROR'));
      return;
    }
    const result = await mockPay({ simulateDecline });
    dispatch(setTransactionId(result.transactionId));
    dispatch(setPaymentStatus(result.status));
    dispatch(setMockStock(result.stock));
    dispatch(setStep('status'));
  };

  return (
    <Backdrop
      title="Order summary"
      footer={
        <>
          {isMockMode() ? (
            <label className="nora-summary__toggle">
              <input
                type="checkbox"
                checked={simulateDecline}
                onChange={(e) => dispatch(setSimulateDecline(e.target.checked))}
              />
              Simulate declined payment
            </label>
          ) : null}
          <Button fullWidth onClick={onPay} disabled={paying}>
            {paying ? 'Processing…' : 'Pay'}
          </Button>
          <Link className="nora-summary__back" to="/checkout">
            Edit card & delivery
          </Link>
        </>
      }
    >
      <BrandLockup size="sm" />
      <p className="nora-summary__product">{MOCK_PRODUCT.name}</p>
      <FeeList
        lines={[
          { label: 'Product', amountMinor: MOCK_PRODUCT.priceMinor },
          { label: 'Base fee', amountMinor: fees.baseFee },
          { label: 'Delivery fee', amountMinor: fees.deliveryFee },
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
          Deliver to {delivery.fullName}, {delivery.address}, {delivery.city}
        </p>
      </div>
    </Backdrop>
  );
}
