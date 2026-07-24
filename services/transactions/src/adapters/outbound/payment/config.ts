export type PaymentGatewayConfig = {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  integrityKey: string;
  currency?: string;
  pollAttempts?: number;
  pollDelayMs?: number;
};

export function readPaymentGatewayConfig(
  env: NodeJS.ProcessEnv = process.env,
): PaymentGatewayConfig | { missing: string[] } {
  const apiUrl = env.PAYMENT_API_URL?.trim() ?? '';
  const publicKey = env.PAYMENT_PUBLIC_KEY?.trim() ?? '';
  const privateKey = env.PAYMENT_PRIVATE_KEY?.trim() ?? '';
  const integrityKey = env.PAYMENT_INTEGRITY_KEY?.trim() ?? '';

  const missing: string[] = [];
  if (!apiUrl) missing.push('PAYMENT_API_URL');
  if (!publicKey) missing.push('PAYMENT_PUBLIC_KEY');
  if (!privateKey) missing.push('PAYMENT_PRIVATE_KEY');
  if (!integrityKey) missing.push('PAYMENT_INTEGRITY_KEY');

  if (missing.length > 0) {
    return { missing };
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    publicKey,
    privateKey,
    integrityKey,
    currency: env.PAYMENT_CURRENCY?.trim() || 'COP',
    pollAttempts: Number(env.PAYMENT_POLL_ATTEMPTS ?? 12),
    pollDelayMs: Number(env.PAYMENT_POLL_DELAY_MS ?? 1000),
  };
}
