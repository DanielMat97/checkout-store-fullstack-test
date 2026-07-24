import { Module } from '@nestjs/common';
import { createPersistence } from '@app/persistence';
import { CreateTransactionUseCase } from '../../../application/create-transaction.use-case';
import { PayTransactionUseCase } from '../../../application/pay-transaction.use-case';
import { FakePaymentGateway } from '../payment/fake-payment.gateway';
import {
  CUSTOMER_READER,
  DELIVERY_WRITER,
  PAYMENT_GATEWAY,
  PRODUCT_READER,
  TRANSACTION_REPOSITORY,
} from '../../../ports/injection.tokens';
import { TransactionsController } from '../../inbound/http/transactions.controller';

function persistence() {
  return createPersistence();
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
      useFactory: () => {
        const mode = (process.env.PAYMENT_GATEWAY_MODE ?? 'fake') as
          | 'APPROVED'
          | 'DECLINED'
          | 'ERROR'
          | 'fake';
        if (mode === 'DECLINED' || mode === 'ERROR' || mode === 'APPROVED') {
          return new FakePaymentGateway(mode);
        }
        // Default until payment-gateway feature ships real sandbox adapter
        return new FakePaymentGateway('APPROVED');
      },
    },
    CreateTransactionUseCase,
    PayTransactionUseCase,
  ],
})
export class TransactionsApplicationModule {}
