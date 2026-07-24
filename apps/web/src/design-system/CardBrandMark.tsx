import type { CardBrand } from '../features/checkout/card';
import './card-brand.css';

export function CardBrandMark({ brand }: { brand: CardBrand }) {
  if (brand === 'unknown') {
    return <span className="nora-card-brand nora-card-brand--muted">Card</span>;
  }
  return (
    <span
      className={`nora-card-brand nora-card-brand--${brand}`}
      aria-label={brand === 'visa' ? 'Visa' : 'Mastercard'}
    >
      {brand === 'visa' ? 'VISA' : 'MC'}
    </span>
  );
}
