import { Module } from '@nestjs/common';
import { createPersistence, type DeliveryRepositoryPort } from '@app/persistence';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
} from '../../../application/delivery.use-cases';
import { DeliveriesController } from '../../inbound/http/deliveries.controller';
import { DELIVERY_REPOSITORY } from '../../../ports/tokens';

@Module({
  controllers: [DeliveriesController],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useFactory: (): DeliveryRepositoryPort => createPersistence().deliveries,
    },
    CreateDeliveryUseCase,
    GetDeliveryUseCase,
  ],
  exports: [DELIVERY_REPOSITORY],
})
export class DeliveriesPersistenceModule {}
