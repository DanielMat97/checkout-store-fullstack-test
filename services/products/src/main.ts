import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestStandardLogger, createLogger } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new NestStandardLogger('products'),
  });
  const logger = createLogger('products');
  const prefix = process.env.SERVICE_PREFIX ?? 'products';

  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('Checkout store — products microservice (via API Gateway /products)')
    .setVersion('0.1.0')
    .addServer('/', 'API Gateway / local service')
    .build();
  SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  logger.info('server.started', { port, prefix });
}

bootstrap();
