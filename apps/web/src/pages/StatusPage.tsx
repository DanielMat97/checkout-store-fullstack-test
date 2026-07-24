import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import './pages.css';

export function StatusPage() {
  const status = useAppSelector((s) => s.checkout.paymentStatus);

  return (
    <main className="page">
      <p className="brand">Checkout Store</p>
      <h1>Payment status</h1>
      <p className="lede">Result screen scaffold. Status: {status}</p>
      <Link className="cta linkish" to="/">
        Back to product
      </Link>
    </main>
  );
}
