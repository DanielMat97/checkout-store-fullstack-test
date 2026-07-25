import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { domainErrorToHttp } from '@app/shared';
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
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  async get(@Param('id') id: string) {
    const result = await this.getCustomer.execute(id);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
