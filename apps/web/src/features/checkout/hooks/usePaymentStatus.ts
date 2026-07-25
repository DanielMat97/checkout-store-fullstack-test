import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withViewTransition } from '../../../design-system';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { resetCheckout, setProductStock, setStep } from '../../../store/checkoutSlice';
import { pollProductStockUntilChanged, refreshProductStock } from '../checkoutApi';

export function usePaymentStatus() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.checkout.paymentStatus);
  const transactionId = useAppSelector((s) => s.checkout.transactionId);
  const productId = useAppSelector((s) => s.checkout.productId);
  const paymentError = useAppSelector((s) => s.checkout.paymentError);
  const previousStock = useAppSelector((s) =>
    productId ? s.checkout.stocks[productId] : undefined,
  );

  const approved = status === 'APPROVED';
  const pending = status === 'PENDING';
  const errored = status === 'ERROR';

  useEffect(() => {
    if (!approved || !productId) return;
    let cancelled = false;
    const baseline = previousStock ?? 0;
    (async () => {
      const stock = await pollProductStockUntilChanged(productId, baseline);
      if (!cancelled) {
        dispatch(setProductStock({ productId, stock }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally once on APPROVED mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approved, productId, dispatch]);

  const title = pending
    ? 'Confirming'
    : approved
      ? 'Approved'
      : errored
        ? 'Something went wrong'
        : 'Declined';

  const body = pending
    ? 'A quiet moment while we speak with the payment provider.'
    : approved
      ? 'Your order is reserved. Delivery details are ready for fulfillment.'
      : errored
        ? (paymentError ??
          'We could not reach the payment service. Check your connection and try again.')
        : 'No charge was taken and stock stays as it was. You can try another card.';

  const onContinue = async () => {
    const target = productId ? `/product/${productId}` : '/';
    if (approved && productId) {
      try {
        const stock = await refreshProductStock(productId);
        dispatch(setProductStock({ productId, stock }));
      } catch {
        // Product page will reload stock from API/catalog.
      }
      dispatch(setStep('product'));
    } else {
      dispatch(resetCheckout());
    }
    withViewTransition(() => navigate(target));
  };

  const onRetry = () => {
    dispatch(resetCheckout());
    const target = productId ? `/product/${productId}/checkout` : '/';
    withViewTransition(() => navigate(target));
  };

  return {
    status,
    transactionId,
    approved,
    pending,
    errored,
    title,
    body,
    onContinue,
    onRetry,
  };
}
