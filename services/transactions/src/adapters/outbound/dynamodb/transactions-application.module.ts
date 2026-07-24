import { Module } from '@nestjs/common';
import { createPersistence } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { FakePaymentGateway } from '../payment/fake-payment.gateway';
import { SandboxPaymentGateway } from '../payment/sandbox-payment.gateway';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  PAYMENT_GATEWAY,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../../../ports/injection.tokens';
import { TransactionsController } from '../../inbound/http/transactions.controller';
import type { PaymentGatewayPort } from '../../../ports/payment-gateway.port';

function persistence() {
  return createPersistence();
}

function createPaymentGateway(): PaymentGatewayPort {
  const mode = (process.env.PAYMENT_GATEWAY_MODE ?? 'sandbox').toLowerCase();

  if (mode === 'fake' || mode === 'approved' || mode === 'declined' || mode === 'error') {
    const fakeMode =
      mode === 'declined' ? 'DECLINED' : mode === 'error' ? 'ERROR' : 'APPROVED';
    return new FakePaymentGateway(fakeMode);
  }

  const sandbox = SandboxPaymentGateway.fromEnv();
  if (sandbox.isErr()) {
    const message =
      sandbox.error.type === 'VALIDATION' ||
      sandbox.error.type === 'PAYMENT_FAILED' ||
      sandbox.error.type === 'INVALID_STATE' ||
      sandbox.error.type === 'PERSISTENCE_ERROR'
        ? sandbox.error.message
        : sandbox.error.type;
    throw new Error(message);
  }
  return sandbox.value;
}

@Module({
  controllers: [TransactionsController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useFactory: () => persistence().transactions,
    },
    {
      provide: PRODUCT_READER,
      useFactory: () => persistence().products,
    },
    {
      provide: CUSTOMER_READER,
      useFactory: () => persistence().customers,
    },
    {
      provide: DELIVERY_WRITER,
      useFactory: () => persistence().deliveries,
    },
    {
      provide: PAYMENT_GATEWAY,
      useFactory: createPaymentGateway,
    },
    CreateTransactionUseCase,
    PayTransactionUseCase,
  ],
})
export class TransactionsApplicationModule {}
