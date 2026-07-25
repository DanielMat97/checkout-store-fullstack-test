import { Link } from 'react-router-dom';
import {
  Backdrop,
  BrandLockup,
  Button,
  CardBrandMark,
  FeeList,
} from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { useSummaryPay } from './hooks/useSummaryPay';
import './summary.css';

export function SummaryPage() {
  const {
    ready,
    product,
    delivery,
    cardMeta,
    fees,
    total,
    paying,
    simulateDecline,
    onPay,
    setDecline,
  } = useSummaryPay();

  if (!ready || !product || !delivery || !cardMeta) return null;

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
                onChange={(e) => setDecline(e.target.checked)}
              />
              Simulate decline
            </label>
          ) : null}
          <Button fullWidth onClick={() => void onPay()} disabled={paying}>
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
