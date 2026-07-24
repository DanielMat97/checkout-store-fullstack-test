import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccessLogMiddleware } from '@app/shared';
import { HealthController } from './adapters/inbound/http/health.controller';
import { SecurityHeadersMiddleware } from './adapters/inbound/http/security-headers.middleware';
import { TransactionsApplicationModule } from './adapters/outbound/dynamodb/transactions-application.module';

@Module({
  imports: [TransactionsApplicationModule],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware, AccessLogMiddleware('transactions'))
      .forRoutes('*');
  }
}
