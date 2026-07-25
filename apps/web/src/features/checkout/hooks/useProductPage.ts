import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectProduct,
  setPaymentStatus,
  setProductStock,
  setStep,
} from '../../../store/checkoutSlice';
import { loadProduct, type Product } from '../checkoutApi';

export function useProductPage() {
  const { productId = '' } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stocks = useAppSelector((s) => s.checkout.stocks);
  const lastStatus = useAppSelector((s) => s.checkout.paymentStatus);
  const selectedId = useAppSelector((s) => s.checkout.productId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const loaded = await loadProduct(productId);
      if (cancelled) return;
      if (!loaded) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(loaded);
      dispatch(setProductStock({ productId: loaded.id, stock: loaded.stock }));
      if (selectedId !== loaded.id) {
        dispatch(selectProduct(loaded.id));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, selectedId, dispatch, navigate]);

  const units = product ? (stocks[product.id] ?? product.stock) : 0;

  const onPay = () => {
    if (!product) return;
    dispatch(setPaymentStatus('idle'));
    dispatch(setStep('card-delivery'));
    withViewTransition(() => navigate(`/product/${product.id}/checkout`));
  };

  const backHome = (e: MouseEvent) => {
    e.preventDefault();
    withViewTransition(() => navigate('/'));
  };

  return {
    product,
    loading,
    units,
    lastStatus,
    selectedId,
    onPay,
    backHome,
  };
}
