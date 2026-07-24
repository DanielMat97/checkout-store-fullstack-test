import { Badge } from './Badge';

export function StockBadge({ units }: { units: number }) {
  if (units <= 0) {
    return <Badge tone="danger">Out of stock</Badge>;
  }
  if (units <= 3) {
    return <Badge tone="warning">{units} left</Badge>;
  }
  return <Badge tone="success">{units} in stock</Badge>;
}
