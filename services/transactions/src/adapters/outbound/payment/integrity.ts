import { createHash } from 'crypto';

/** SHA-256(`${reference}${amountInCents}${currency}${integrityKey}`) */
export function buildIntegritySignature(input: {
  reference: string;
  amountInCents: number;
  currency: string;
  integrityKey: string;
}): string {
  const raw = `${input.reference}${input.amountInCents}${input.currency}${input.integrityKey}`;
  return createHash('sha256').update(raw).digest('hex');
}
