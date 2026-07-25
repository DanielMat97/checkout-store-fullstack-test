import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectProduct, setStocks } from '../../../store/checkoutSlice';
import { listCatalogProducts, type Product } from '../checkoutApi';

export function useCatalog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stocks = useAppSelector((s) => s.checkout.stocks);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await listCatalogProducts();
        if (cancelled) return;
        setProducts(items);
        dispatch(setStocks(Object.fromEntries(items.map((p) => [p.id, p.stock]))));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load catalog.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const openProduct = (id: string) => {
    dispatch(selectProduct(id));
    withViewTransition(() => navigate(`/product/${id}`));
  };

  return {
    products,
    featured: products[0],
    rest: products.slice(1),
    stocks,
    loading,
    error,
    openProduct,
  };
}
