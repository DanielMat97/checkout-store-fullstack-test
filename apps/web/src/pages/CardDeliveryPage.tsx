import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setStep } from '../store/checkoutSlice';
import './pages.css';

export function CardDeliveryPage() {
  const dispatch = useAppDispatch();

  return (
    <main className="page">
      <p className="brand">Checkout Store</p>
      <h1>Card & delivery</h1>
      <p className="lede">
        Modal form scaffold — validation (Luhn, VISA/MC) lands in T6.
      </p>
      <button
        type="button"
        className="cta"
        onClick={() => dispatch(setStep('summary'))}
      >
        Continue to summary
      </button>
      <Link className="back" to="/">
        Back to product
      </Link>
    </main>
  );
}
