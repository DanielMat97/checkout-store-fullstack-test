import {
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List seeded products' })
  async list() {
    const result = await this.listProducts.execute();
    if (result.isErr()) {
      throw new HttpException({ error: result.error }, 500);
    }
    return { items: result.value };
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Get product stock only' })
  @ApiParam({ name: 'id', example: 'prod_aura_quiet' })
  async stock(@Param('id') id: string) {
    const result = await this.getProduct.execute(id);
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return {
      productId: result.value.id,
      stock: result.value.stock,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', example: 'prod_aura_quiet' })
  async get(@Param('id') id: string) {
    const result = await this.getProduct.execute(id);
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }
}
