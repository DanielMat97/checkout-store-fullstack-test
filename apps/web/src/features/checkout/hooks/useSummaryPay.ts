import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { ApiError } from '../../../api/types';
import { isMockMode } from '../../../mocks/checkoutService';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setPaymentError,
  setPaymentStatus,
  setProductStock,
  setSimulateDecline,
  setStep,
  setStocks,
  setTransactionId,
} from '../../../store/checkoutSlice';
import { takePendingCard } from '../cardSession';
import { executePay, getFees, loadProduct, type Product } from '../checkoutApi';

export function useSummaryPay() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const delivery = useAppSelector((s) => s.checkout.delivery);
  const cardMeta = useAppSelector((s) => s.checkout.cardMeta);
  const productId = useAppSelector((s) => s.checkout.productId);
  const simulateDecline = useAppSelector((s) => s.checkout.simulateDecline);
  const paymentStatus = useAppSelector((s) => s.checkout.paymentStatus);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!delivery || !cardMeta) {
      navigate(productId ? `/product/${productId}/checkout` : '/', {
        replace: true,
      });
      return;
    }
    let cancelled = false;
    (async () => {
      if (!productId) {
        navigate('/', { replace: true });
        return;
      }
      const loaded = await loadProduct(productId);
      if (cancelled) return;
      if (!loaded) {
        navigate('/', { replace: true });
        return;
      }
      setProduct(loaded);
    })();
    return () => {
      cancelled = true;
    };
  }, [delivery, cardMeta, productId, navigate]);

  const fees = getFees();
  const total = product ? product.priceMinor + fees.baseFee + fees.deliveryFee : 0;
  const paying = paymentStatus === 'PENDING';
  const ready = Boolean(delivery && cardMeta && product);

  const onPay = async () => {
    if (!product || !delivery || !cardMeta) return;
    const card = takePendingCard();
    if (!isMockMode() && !card) {
      dispatch(setPaymentError('Card details expired. Please re-enter your card.'));
      dispatch(setPaymentStatus('ERROR'));
      withViewTransition(() => navigate('/status'));
      return;
    }

    dispatch(setPaymentError(null));
    dispatch(setPaymentStatus('PENDING'));
    withViewTransition(() => navigate('/status'));

    try {
      const result = await executePay({
        product,
        delivery,
        card: card ?? {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '30',
          cardHolder: cardMeta.holderName,
        },
        simulateDecline,
      });
      dispatch(setTransactionId(result.transactionId));
      dispatch(setPaymentStatus(result.status));
      if (result.stocks) {
        dispatch(setStocks(result.stocks));
      } else {
        dispatch(setProductStock({ productId: product.id, stock: result.stock }));
      }
      dispatch(setStep('status'));
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Payment failed';
      dispatch(setPaymentError(message));
      dispatch(setPaymentStatus('ERROR'));
      dispatch(setStep('status'));
    }
  };

  const setDecline = (value: boolean) => {
    dispatch(setSimulateDecline(value));
  };

  return {
    ready,
    product,
    delivery,
    cardMeta,
    fees,
    total,
    paying,
    simulateDecline,
    onPay,
    setDecline,
  };
}
