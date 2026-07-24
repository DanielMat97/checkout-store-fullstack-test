import { Module } from '@nestjs/common';
import { createPersistence, type TransactionRepositoryPort } from '@app/persistence';
import { TRANSACTION_REPOSITORY } from '../../../ports/tokens';

@Module({
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useFactory: (): TransactionRepositoryPort => createPersistence().transactions,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsPersistenceModule {}
