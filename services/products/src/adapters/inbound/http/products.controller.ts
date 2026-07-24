import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetProductUseCase,
  ListProductsUseCase,
} from '../../../application/product.use-cases';

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(
    private readonly getProduct: GetProductUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async list() {
    const result = await this.listProducts.execute();
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return { items: result.value };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  async get(@Param('id') id: string) {
    const result = await this.getProduct.execute(id);
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }
}
