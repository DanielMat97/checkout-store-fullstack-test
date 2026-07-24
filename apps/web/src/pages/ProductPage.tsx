import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setProductId, setStep } from '../store/checkoutSlice';
import './pages.css';

const DEMO_PRODUCT_ID = 'prod_seed_1';

export function ProductPage() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((s) => s.checkout.step);

  const onPay = () => {
    dispatch(setProductId(DEMO_PRODUCT_ID));
    dispatch(setStep('card-delivery'));
  };

  return (
    <main className="page">
      <p className="brand">Checkout Store</p>
      <h1>Aurora Wireless Headphones</h1>
      <p className="lede">
        Noise-cancelling over-ear headphones. Stock and price load from the API in
        later tasks.
      </p>
      <p className="meta">Stock: — · Price: —</p>
      <button type="button" className="cta" onClick={onPay}>
        Pay with credit card
      </button>
      <p className="hint">Current checkout step: {step}</p>
      <nav className="dev-nav">
        <Link to="/checkout">Card / delivery</Link>
        <Link to="/summary">Summary</Link>
        <Link to="/status">Status</Link>
      </nav>
    </main>
  );
}
