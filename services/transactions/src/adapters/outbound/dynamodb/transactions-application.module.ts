import { Module } from '@nestjs/common';
import { createPersistence } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { ApplyPaymentApprovedEffectsUseCase } from '../../../application/apply-payment-approved-effects.use-case';
import { RestoreTransactionStockUseCase } from '../../../application/restore-transaction-stock.use-case';
import { FakePaymentGateway } from '../payment/fake-payment.gateway';
import { SandboxPaymentGateway } from '../payment/sandbox-payment.gateway';
import { InProcessOrderEventsPublisher } from '../order-events/in-process-order-events.publisher';
import { SqsOrderEventsPublisher } from '../order-events/sqs-order-events.publisher';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  ORDER_EVENTS_PUBLISHER,
  PAYMENT_GATEWAY,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../../../ports/injection.tokens';
import { TransactionsController } from '../../inbound/http/transactions.controller';
import type { PaymentGatewayPort } from '../../../ports/payment-gateway.port';
import type { OrderEventsPublisher } from '../../../ports/order-events.port';

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

function createOrderEventsPublisher(
  applyEffects: ApplyPaymentApprovedEffectsUseCase,
): OrderEventsPublisher {
  const queueUrl = process.env.ORDERS_EVENTS_QUEUE_URL?.trim();
  // Empty / non-HTTP (serverless-offline placeholders) → sync in-process effects
  if (!queueUrl || !queueUrl.startsWith('http')) {
    return new InProcessOrderEventsPublisher(applyEffects);
  }
  return new SqsOrderEventsPublisher(queueUrl);
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
    ApplyPaymentApprovedEffectsUseCase,
    {
      provide: ORDER_EVENTS_PUBLISHER,
      useFactory: createOrderEventsPublisher,
      inject: [ApplyPaymentApprovedEffectsUseCase],
    },
    CreateTransactionUseCase,
    PayTransactionUseCase,
    RestoreTransactionStockUseCase,
  ],
})
export class TransactionsApplicationModule {}
