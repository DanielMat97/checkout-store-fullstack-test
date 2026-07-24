/** Ephemeral card secrets — memory only, never Redux/persist. */
export type PendingCard = {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
};

let pending: PendingCard | null = null;

export function setPendingCard(card: PendingCard): void {
  pending = { ...card };
}

export function peekPendingCard(): PendingCard | null {
  return pending ? { ...pending } : null;
}

/** Read and clear — call once at pay time. */
export function takePendingCard(): PendingCard | null {
  const value = pending;
  pending = null;
  return value ? { ...value } : null;
}

export function clearPendingCard(): void {
  pending = null;
}

/** Parse UI expiry `MM/YY` or `MMYY` → month/year for API. */
export function splitExpiry(expiry: string): { expMonth: string; expYear: string } {
  const digits = expiry.replace(/\D/g, '');
  const expMonth = digits.slice(0, 2);
  const expYear = digits.slice(2, 4);
  return { expMonth, expYear };
}
