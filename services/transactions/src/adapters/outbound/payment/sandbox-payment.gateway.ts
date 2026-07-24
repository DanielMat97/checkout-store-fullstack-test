import { err, ok, type Result } from 'neverthrow';
import type { DomainError } from '../../../domain/errors';
import type {
  CardChargeInput,
  ChargeOutcome,
  PaymentGatewayPort,
} from '../../../ports/payment-gateway.port';
import { readPaymentGatewayConfig, type PaymentGatewayConfig } from './config';
import { buildIntegritySignature } from './integrity';

type FetchLike = typeof fetch;

type MerchantAcceptance = {
  acceptanceToken: string;
  personalAuthToken?: string;
};

/**
 * Sandbox HTTP adapter — talks to the payment provider using env keys only.
 * Never logs PAN/CVV. Never persists card fields.
 */
export class SandboxPaymentGateway implements PaymentGatewayPort {
  constructor(
    private readonly config: PaymentGatewayConfig,
    private readonly fetchFn: FetchLike = fetch,
  ) {}

  static fromEnv(
    env: NodeJS.ProcessEnv = process.env,
    fetchFn: FetchLike = fetch,
  ): Result<SandboxPaymentGateway, DomainError> {
    const config = readPaymentGatewayConfig(env);
    if ('missing' in config) {
      return err({
        type: 'VALIDATION',
        message: `Payment gateway misconfigured: missing ${config.missing.join(', ')}`,
      });
    }
    return ok(new SandboxPaymentGateway(config, fetchFn));
  }

  async charge(input: CardChargeInput): Promise<Result<ChargeOutcome, DomainError>> {
    if (!input.customerEmail) {
      return err({
        type: 'VALIDATION',
        message: 'customerEmail required for sandbox charge',
      });
    }

    try {
      const acceptance = await this.fetchAcceptanceTokens();
      if (acceptance.isErr()) {
        return err(acceptance.error);
      }

      const token = await this.tokenizeCard(input);
      if (token.isErr()) {
        return err(token.error);
      }

      const created = await this.createProviderTransaction({
        input,
        cardToken: token.value,
        acceptance: acceptance.value,
      });
      if (created.isErr()) {
        return err(created.error);
      }

      return this.pollUntilFinal(created.value.id);
    } catch (error) {
      return err({
        type: 'PAYMENT_FAILED',
        message: error instanceof Error ? error.message : 'Payment provider error',
      });
    }
  }

  private async fetchAcceptanceTokens(): Promise<
    Result<MerchantAcceptance, DomainError>
  > {
    const response = await this.fetchFn(
      `${this.config.apiUrl}/merchants/${this.config.publicKey}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
    );
    const body = (await response.json().catch(() => ({}))) as {
      data?: {
        presigned_acceptance?: { acceptance_token?: string };
        presigned_personal_data_auth?: { acceptance_token?: string };
      };
      error?: { reason?: string };
    };

    if (!response.ok) {
      return err({
        type: 'PAYMENT_FAILED',
        message: body.error?.reason ?? `Merchant lookup failed (${response.status})`,
      });
    }

    const acceptanceToken = body.data?.presigned_acceptance?.acceptance_token ?? '';
    if (!acceptanceToken) {
      return err({
        type: 'PAYMENT_FAILED',
        message: 'Missing acceptance_token from merchant endpoint',
      });
    }

    return ok({
      acceptanceToken,
      personalAuthToken: body.data?.presigned_personal_data_auth?.acceptance_token,
    });
  }

  private async tokenizeCard(
    input: CardChargeInput,
  ): Promise<Result<string, DomainError>> {
    const response = await this.fetchFn(`${this.config.apiUrl}/tokens/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.publicKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        number: input.number.replace(/\s+/g, ''),
        cvc: input.cvc,
        exp_month: input.expMonth.padStart(2, '0'),
        exp_year: normalizeYear(input.expYear),
        card_holder: input.cardHolder,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as {
      data?: { id?: string };
      error?: { reason?: string; messages?: unknown };
    };

    if (!response.ok || !body.data?.id) {
      return err({
        type: 'PAYMENT_FAILED',
        message: stringifyProviderError(body) || `Tokenize failed (${response.status})`,
      });
    }

    return ok(body.data.id);
  }

  private async createProviderTransaction(args: {
    input: CardChargeInput;
    cardToken: string;
    acceptance: MerchantAcceptance;
  }): Promise<Result<{ id: string }, DomainError>> {
    const currency = this.config.currency ?? 'COP';
    const signature = buildIntegritySignature({
      reference: args.input.reference,
      amountInCents: args.input.amountMinor,
      currency,
      integrityKey: this.config.integrityKey,
    });

    const payload: Record<string, unknown> = {
      acceptance_token: args.acceptance.acceptanceToken,
      amount_in_cents: args.input.amountMinor,
      currency,
      customer_email: args.input.customerEmail,
      reference: args.input.reference,
      signature,
      payment_method: {
        type: 'CARD',
        token: args.cardToken,
        installments: 1,
      },
    };

    if (args.acceptance.personalAuthToken) {
      payload.accept_personal_auth = args.acceptance.personalAuthToken;
    }

    const response = await this.fetchFn(`${this.config.apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.privateKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => ({}))) as {
      data?: { id?: string; status?: string };
      error?: { reason?: string; messages?: unknown };
    };

    if (!response.ok || !body.data?.id) {
      return err({
        type: 'PAYMENT_FAILED',
        message:
          stringifyProviderError(body) ||
          `Create transaction failed (${response.status})`,
      });
    }

    return ok({ id: body.data.id });
  }

  private async pollUntilFinal(
    providerId: string,
  ): Promise<Result<ChargeOutcome, DomainError>> {
    const attempts = this.config.pollAttempts ?? 12;
    const delayMs = this.config.pollDelayMs ?? 1000;

    for (let i = 0; i < attempts; i++) {
      const response = await this.fetchFn(
        `${this.config.apiUrl}/transactions/${providerId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.privateKey}`,
            Accept: 'application/json',
          },
        },
      );

      const body = (await response.json().catch(() => ({}))) as {
        data?: { id?: string; status?: string; status_message?: string };
      };

      if (!response.ok) {
        return err({
          type: 'PAYMENT_FAILED',
          message: `Get transaction failed (${response.status})`,
        });
      }

      const status = (body.data?.status ?? '').toUpperCase();
      if (status === 'APPROVED') {
        return ok({
          status: 'APPROVED',
          providerRef: body.data?.id ?? providerId,
        });
      }
      if (status === 'DECLINED') {
        return ok({
          status: 'DECLINED',
          providerRef: body.data?.id ?? providerId,
          message: body.data?.status_message,
        });
      }
      if (status === 'ERROR' || status === 'VOIDED') {
        return ok({
          status: 'ERROR',
          providerRef: body.data?.id ?? providerId,
          message: body.data?.status_message ?? status,
        });
      }

      // PENDING / unknown → wait
      if (i < attempts - 1) {
        await sleep(delayMs);
      }
    }

    return ok({
      status: 'ERROR',
      providerRef: providerId,
      message: 'Payment status polling timeout',
    });
  }
}

function normalizeYear(year: string): string {
  const trimmed = year.trim();
  if (trimmed.length === 4) {
    return trimmed.slice(-2);
  }
  return trimmed.padStart(2, '0');
}

function stringifyProviderError(body: {
  error?: { reason?: string; messages?: unknown };
}): string {
  if (body.error?.reason) {
    return body.error.reason;
  }
  if (body.error?.messages) {
    try {
      return JSON.stringify(body.error.messages);
    } catch {
      return 'Provider error';
    }
  }
  return '';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
