import { useNavigate } from 'react-router-dom';
import { AppShell, BrandLockup, Button, withViewTransition } from '../../design-system';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetCheckout, setStep } from '../../store/checkoutSlice';
import './status.css';

export function StatusPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.checkout.paymentStatus);
  const transactionId = useAppSelector((s) => s.checkout.transactionId);
  const productId = useAppSelector((s) => s.checkout.productId);
  const paymentError = useAppSelector((s) => s.checkout.paymentError);

  const approved = status === 'APPROVED';
  const pending = status === 'PENDING';
  const errored = status === 'ERROR';

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

  const onContinue = () => {
    const target = productId ? `/product/${productId}` : '/';
    if (!approved) {
      dispatch(resetCheckout());
    } else {
      dispatch(setStep('product'));
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
