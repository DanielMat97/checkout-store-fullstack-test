import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CatalogPage } from './features/checkout/CatalogPage';
import { ProductPage } from './features/checkout/ProductPage';
import { CheckoutPage } from './features/checkout/CheckoutPage';
import { SummaryPage } from './features/checkout/SummaryPage';
import { StatusPage } from './features/checkout/StatusPage';
import { OrdersPage } from './features/orders/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/product/:productId/checkout" element={<CheckoutPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
