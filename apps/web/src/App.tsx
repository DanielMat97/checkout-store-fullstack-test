import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProductPage } from './features/checkout/ProductPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { SummaryPage } from './features/checkout/SummaryPage';
import { StatusPage } from './features/checkout/StatusPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
