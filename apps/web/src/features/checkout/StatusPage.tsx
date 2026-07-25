import { AppShell, BrandLockup, Button } from '../../design-system';
import { usePaymentStatus } from './hooks/usePaymentStatus';
import './status.css';

export function StatusPage() {
  const {
    status,
    transactionId,
    approved,
    pending,
    errored,
    title,
    body,
    onContinue,
    onRetry,
  } = usePaymentStatus();

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
              onClick={() => void onContinue()}
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
