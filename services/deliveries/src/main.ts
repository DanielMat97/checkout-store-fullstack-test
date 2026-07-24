import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createLogger } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const logger = createLogger('deliveries');
  const prefix = process.env.SERVICE_PREFIX ?? 'deliveries';

  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  const config = new DocumentBuilder()
    .setTitle('Deliveries API')
    .setDescription('Checkout store — deliveries microservice (via API Gateway /deliveries)')
    .setVersion('0.1.0')
    .addServer('/', 'API Gateway / local service')
    .build();
  SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3003);
  await app.listen(port);
  logger.info('server.started', { port, prefix });
}

bootstrap();
