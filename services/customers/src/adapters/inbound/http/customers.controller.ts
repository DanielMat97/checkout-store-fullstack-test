import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateCustomerUseCase,
  GetCustomerUseCase,
} from '../../../application/customer.use-cases';

@ApiTags('customers')
@Controller()
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  async create(
    @Body()
    body: { fullName: string; email: string; phone: string },
  ) {
    const result = await this.createCustomer.execute(body);
    if (result.isErr()) {
      if (result.error.type === 'VALIDATION') {
        throw new BadRequestException(result.error);
      }
      throw new NotFoundException(result.error);
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
