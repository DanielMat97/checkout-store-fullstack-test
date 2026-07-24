import { formatMoney } from './format';
import './fee-list.css';

export interface FeeLine {
  label: string;
  amountMinor: number;
  emphasis?: boolean;
}

export function FeeList({ lines }: { lines: FeeLine[] }) {
  return (
    <ul className="nora-fees">
      {lines.map((line) => (
        <li
          key={line.label}
          className={
            line.emphasis ? 'nora-fees__item nora-fees__item--total' : 'nora-fees__item'
          }
        >
          <span>{line.label}</span>
          <span>{formatMoney(line.amountMinor)}</span>
        </li>
      ))}
    </ul>
  );
}
