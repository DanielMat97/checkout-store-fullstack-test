import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDeliveryUseCase } from '../../../application/delivery.use-cases';

@ApiTags('deliveries')
@Controller()
export class DeliveriesController {
  constructor(private readonly getDelivery: GetDeliveryUseCase) {}

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
