import { SandboxPaymentGateway } from './sandbox-payment.gateway';
import type { PaymentGatewayConfig } from './config';

const baseConfig: PaymentGatewayConfig = {
  apiUrl: 'https://payment.example.test/v1',
  publicKey: 'pub_test_xxx',
  privateKey: 'prv_test_xxx',
  integrityKey: 'integrity_test_xxx',
  currency: 'COP',
  pollAttempts: 3,
  pollDelayMs: 1,
};

const cardInput = {
  amountMinor: 150000,
  reference: 'tx_ref_1',
  customerEmail: 'ada@example.com',
  number: '4242424242424242',
  cvc: '123',
  expMonth: '12',
  expYear: '30',
  cardHolder: 'Ada Lovelace',
};

describe('SandboxPaymentGateway', () => {
  it('fails fromEnv when keys missing', () => {
    const result = SandboxPaymentGateway.fromEnv({});
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('VALIDATION');
      if (result.error.type === 'VALIDATION') {
        expect(result.error.message).toContain('PAYMENT_API_URL');
      }
    }
  });

  it('APPROVED after tokenize + create + poll', async () => {
    const fetchFn = jest.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      if (href.includes('/merchants/')) {
        return jsonResponse({
          data: {
            presigned_acceptance: { acceptance_token: 'acc_1' },
            presigned_personal_data_auth: { acceptance_token: 'pers_1' },
          },
        });
      }
      if (href.endsWith('/tokens/cards') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body));
        expect(body.number).toBe('4242424242424242');
        expect(body.cvc).toBe('123');
        return jsonResponse({ data: { id: 'tok_1' } });
      }
      if (href.endsWith('/transactions') && init?.method === 'POST') {
        const body = JSON.parse(String(init.body));
        expect(body.reference).toBe('tx_ref_1');
        expect(body.payment_method.token).toBe('tok_1');
        expect(body.acceptance_token).toBe('acc_1');
        expect(body.signature).toHaveLength(64);
        return jsonResponse({ data: { id: 'prov_1', status: 'PENDING' } });
      }
      if (href.endsWith('/transactions/prov_1')) {
        return jsonResponse({ data: { id: 'prov_1', status: 'APPROVED' } });
      }
      throw new Error(`Unexpected URL ${href}`);
    }) as unknown as typeof fetch;

    const gateway = new SandboxPaymentGateway(baseConfig, fetchFn);
    const result = await gateway.charge(cardInput);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.providerRef).toBe('prov_1');
    }
  });

  it('maps DECLINED from provider poll', async () => {
    let step = 0;
    const fetchFn = jest.fn(async () => {
      step += 1;
      if (step === 1) {
        return jsonResponse({
          data: { presigned_acceptance: { acceptance_token: 'acc_1' } },
        });
      }
      if (step === 2) {
        return jsonResponse({ data: { id: 'tok_1' } });
      }
      if (step === 3) {
        return jsonResponse({ data: { id: 'prov_2', status: 'PENDING' } });
      }
      return jsonResponse({
        data: { id: 'prov_2', status: 'DECLINED', status_message: 'Rejected' },
      });
    }) as unknown as typeof fetch;

    const gateway = new SandboxPaymentGateway(baseConfig, fetchFn);
    const result = await gateway.charge(cardInput);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.status).toBe('DECLINED');
    }
  });

  it('returns PAYMENT_FAILED when tokenize fails', async () => {
    let step = 0;
    const fetchFn = jest.fn(async () => {
      step += 1;
      if (step === 1) {
        return jsonResponse({
          data: { presigned_acceptance: { acceptance_token: 'acc_1' } },
        });
      }
      return jsonResponse({ error: { reason: 'Invalid card' } }, { status: 422 });
    }) as unknown as typeof fetch;

    const gateway = new SandboxPaymentGateway(baseConfig, fetchFn);
    const result = await gateway.charge(cardInput);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('PAYMENT_FAILED');
    }
  });
});

function jsonResponse(body: unknown, opts?: { status?: number }): Response {
  return {
    ok: (opts?.status ?? 200) >= 200 && (opts?.status ?? 200) < 300,
    status: opts?.status ?? 200,
    json: async () => body,
  } as Response;
}
