import { Module } from '@nestjs/common';
import { createPersistence, type ProductRepositoryPort } from '@app/persistence';
import { PRODUCT_REPOSITORY } from '../../../ports/tokens';

@Module({
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (): ProductRepositoryPort => createPersistence().products,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsPersistenceModule {}
