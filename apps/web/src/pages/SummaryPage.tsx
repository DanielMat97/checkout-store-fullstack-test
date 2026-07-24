import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setStep } from '../store/checkoutSlice';
import './pages.css';

export function SummaryPage() {
  const dispatch = useAppDispatch();

  return (
    <main className="page backdrop-shell">
      <p className="brand">Checkout Store</p>
      <h1>Payment summary</h1>
      <p className="lede">
        Material Backdrop + fee lines (product + base fee + delivery) in T7.
      </p>
      <ul className="fees">
        <li>Product —</li>
        <li>Base fee —</li>
        <li>Delivery fee —</li>
        <li>
          <strong>Total —</strong>
        </li>
      </ul>
      <button
        type="button"
        className="cta"
        onClick={() => dispatch(setStep('status'))}
      >
        Pay
      </button>
      <Link className="back" to="/checkout">
        Back
      </Link>
    </main>
  );
}
