import { useNavigate } from 'react-router-dom';
import { AppShell, BrandLockup, Button } from '../../design-system';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetCheckout, setStep } from '../../store/checkoutSlice';
import './status.css';

export function StatusPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.checkout.paymentStatus);
  const transactionId = useAppSelector((s) => s.checkout.transactionId);

  const approved = status === 'APPROVED';
  const pending = status === 'PENDING';

  const title = pending
    ? 'Processing payment'
    : approved
      ? 'Payment approved'
      : 'Payment declined';

  const body = pending
    ? 'Confirming with the payment provider…'
    : approved
      ? 'Your headphones are reserved. Delivery details were saved for fulfillment.'
      : 'No charge was completed and stock was not reduced. You can try again with another card.';

  const onContinue = () => {
    dispatch(setStep('product'));
    if (!approved) {
      dispatch(resetCheckout());
    }
    navigate('/');
  };

  return (
    <AppShell>
      <main className={`nora-status nora-status--${status.toLowerCase()}`}>
        <BrandLockup size="md" />
        <div className="nora-status__icon" aria-hidden="true">
          {pending ? '…' : approved ? '✓' : '!'}
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
