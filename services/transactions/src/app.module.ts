import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccessLogMiddleware } from '@app/shared';
import { HealthController } from './adapters/inbound/http/health.controller';
import { SecurityHeadersMiddleware } from './adapters/inbound/http/security-headers.middleware';
import { TransactionsPersistenceModule } from './adapters/outbound/dynamodb/transactions-persistence.module';

@Module({
  imports: [TransactionsPersistenceModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware, AccessLogMiddleware('transactions'))
      .forRoutes('*');
  }
}
