import { Module } from '@nestjs/common';
import {
  createPersistence,
  type CustomerRepositoryPort,
} from '@app/persistence';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';

@Module({
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (): CustomerRepositoryPort => createPersistence().customers,
    },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersPersistenceModule {}
