import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateCustomerUseCase,
  GetCustomerUseCase,
} from '../../../application/customer.use-cases';
import { CreateCustomerDto } from './dto';

@ApiTags('customers')
@Controller()
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customer (no card data)' })
  async create(@Body() body: CreateCustomerDto) {
    const result = await this.createCustomer.execute(body);
    if (result.isErr()) {
      if (result.error.type === 'VALIDATION') {
        throw new BadRequestException(result.error);
      }
      throw new HttpException({ error: result.error }, 500);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  async get(@Param('id') id: string) {
    const result = await this.getCustomer.execute(id);
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }
}
