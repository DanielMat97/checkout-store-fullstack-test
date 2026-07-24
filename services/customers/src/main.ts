import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestStandardLogger, createLogger, applyGlobalValidation } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new NestStandardLogger('customers'),
  });
  const logger = createLogger('customers');
  const prefix = process.env.SERVICE_PREFIX ?? 'customers';

  app.setGlobalPrefix(prefix);
  applyGlobalValidation(app);
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  const config = new DocumentBuilder()
    .setTitle('Customers API')
    .setDescription(
      'Checkout store — customers microservice (via API Gateway /customers)',
    )
    .setVersion('0.1.0')
    .addServer('/', 'API Gateway / local service')
    .build();
  SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
  logger.info('server.started', { port, prefix });
}

bootstrap();
