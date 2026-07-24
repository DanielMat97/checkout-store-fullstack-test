import { formatMoney } from './format';
import './price.css';

export function Price({
  minorUnits,
  size = 'md',
}: {
  minorUnits: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span className={`nora-price nora-price--${size}`}>{formatMoney(minorUnits)}</span>
  );
}
