import { Module } from '@nestjs/common';
import { createPersistence, type ProductRepositoryPort } from '@app/persistence';
import {
  GetProductUseCase,
  ListProductsUseCase,
} from '../../../application/product.use-cases';
import { ProductsController } from '../../inbound/http/products.controller';
import { PRODUCT_REPOSITORY } from '../../../ports/tokens';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: (): ProductRepositoryPort => createPersistence().products,
    },
    GetProductUseCase,
    ListProductsUseCase,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsPersistenceModule {}
