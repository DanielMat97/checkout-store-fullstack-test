import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { domainErrorToHttp } from '@app/shared';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
  UpdateDeliveryStatusUseCase,
} from '../../../application/delivery.use-cases';
import { CreateDeliveryDto, UpdateDeliveryStatusDto } from './dto';

@ApiTags('deliveries')
@Controller()
export class DeliveriesController {
  constructor(
    private readonly createDelivery: CreateDeliveryUseCase,
    private readonly getDelivery: GetDeliveryUseCase,
    private readonly updateStatus: UpdateDeliveryStatusUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create delivery (standalone; pay flow also creates one)' })
  async create(@Body() body: CreateDeliveryDto) {
    const result = await this.createDelivery.execute(body);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by id' })
  async get(@Param('id') id: string) {
    const result = await this.getDelivery.execute(id);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update delivery status (FULFILLABLE → FULFILLED)' })
  async patch(@Param('id') id: string, @Body() body: UpdateDeliveryStatusDto) {
    const result = await this.updateStatus.execute(id, body.status);
    if (result.isErr()) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
