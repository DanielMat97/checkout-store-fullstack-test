import { Module } from '@nestjs/common';
import {
  createPersistence,
  type DeliveryRepositoryPort,
} from '@app/persistence';
import { DELIVERY_REPOSITORY } from '../../../ports/tokens';

@Module({
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useFactory: (): DeliveryRepositoryPort => createPersistence().deliveries,
    },
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesPersistenceModule {}
