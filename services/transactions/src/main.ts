import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  NestStandardLogger,
  createLogger,
  applyGlobalValidation,
  applySecuritySurface,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new NestStandardLogger('transactions'),
  });
  const logger = createLogger('transactions');
  const prefix = process.env.SERVICE_PREFIX ?? 'transactions';

  app.setGlobalPrefix(prefix);
  applySecuritySurface(app);
  applyGlobalValidation(app);
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  const config = new DocumentBuilder()
    .setTitle('Transactions API')
    .setDescription(
      'Checkout store — transactions microservice (via API Gateway /transactions)',
    )
    .setVersion('0.1.0')
    .addServer('/', 'API Gateway / local service')
    .build();
  SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3004);
  await app.listen(port);
  logger.info('server.started', { port, prefix });
}

bootstrap();
