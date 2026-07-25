import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BrandLockup, Button, withViewTransition } from '../../design-system';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetCheckout, setProductStock, setStep } from '../../store/checkoutSlice';
import { pollProductStockUntilChanged, refreshProductStock } from './checkoutApi';
import './status.css';

export function StatusPage() {
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

  return (
    <AppShell>
      <main className={`nora-status nora-status--${status.toLowerCase()}`}>
        <div className="nora-status__ambient" aria-hidden="true" />
        <BrandLockup size="md" />
        <div className="nora-status__icon" aria-hidden="true">
          {pending ? <span className="nora-status__spinner" /> : approved ? '✓' : '!'}
        </div>
        <h1>{title}</h1>
        <p>{body}</p>
        {transactionId ? <p className="nora-status__id">Ref {transactionId}</p> : null}
        {!pending ? (
          <div className="nora-status__actions">
            {errored ? (
              <Button fullWidth onClick={onRetry}>
                Retry
              </Button>
            ) : null}
            <Button
              fullWidth
              onClick={onContinue}
              variant={errored ? 'ghost' : undefined}
            >
              {approved ? 'Back to product' : errored ? 'Back' : 'Try again'}
            </Button>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
