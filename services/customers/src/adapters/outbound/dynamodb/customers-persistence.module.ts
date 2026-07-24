import { Module } from '@nestjs/common';
import {
  createPersistence,
  type CustomerRepositoryPort,
} from '@app/persistence';
import {
  CreateCustomerUseCase,
  GetCustomerUseCase,
} from '../../../application/customer.use-cases';
import { CustomersController } from '../../inbound/http/customers.controller';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';

@Module({
  controllers: [CustomersController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useFactory: (): CustomerRepositoryPort => createPersistence().customers,
    },
    CreateCustomerUseCase,
    GetCustomerUseCase,
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersPersistenceModule {}
