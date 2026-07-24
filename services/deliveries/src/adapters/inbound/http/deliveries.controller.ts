import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
} from '../../../application/delivery.use-cases';
import { CreateDeliveryDto } from './dto';

@ApiTags('deliveries')
@Controller()
export class DeliveriesController {
  constructor(
    private readonly createDelivery: CreateDeliveryUseCase,
    private readonly getDelivery: GetDeliveryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create delivery (standalone; pay flow also creates one)' })
  async create(@Body() body: CreateDeliveryDto) {
    const result = await this.createDelivery.execute(body);
    if (result.isErr()) {
      if (result.error.type === 'VALIDATION') {
        throw new BadRequestException(result.error);
      }
      throw new HttpException({ error: result.error }, 500);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by id' })
  async get(@Param('id') id: string) {
    const result = await this.getDelivery.execute(id);
    if (result.isErr()) {
      throw new NotFoundException(result.error);
    }
    return result.value;
  }
}
