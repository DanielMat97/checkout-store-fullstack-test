import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createLogger } from '@app/shared';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = createLogger('customers');

  @Get()
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    this.logger.info('health.checked');
    return { status: 'ok', service: 'customers' };
  }
}
