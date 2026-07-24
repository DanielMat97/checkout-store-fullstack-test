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

  const approved = status === 'APPROVED';
  const pending = status === 'PENDING';

  const title = pending
    ? 'Confirming'
    : approved
      ? 'Approved'
      : 'Declined';

  const body = pending
    ? 'A quiet moment while we speak with the payment provider.'
    : approved
      ? 'Your order is reserved. Delivery details are ready for fulfillment.'
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
        {transactionId ? (
          <p className="nora-status__id">Ref {transactionId}</p>
        ) : null}
        {!pending ? (
          <Button fullWidth onClick={onContinue}>
            {approved ? 'Back to product' : 'Try again'}
          </Button>
        ) : null}
      </main>
    </AppShell>
  );
}
