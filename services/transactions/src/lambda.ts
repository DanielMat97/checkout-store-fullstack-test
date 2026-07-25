import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Context } from 'aws-lambda';
import { AppModule } from './app.module';
import {
  NestStandardLogger,
  createLogger,
  applyGlobalValidation,
  applySecuritySurface,
} from '@app/shared';

type AsyncHandler = (event: unknown, context: Context) => Promise<unknown>;

const serviceName = process.env.SERVICE_NAME ?? 'transactions';
let cachedServer: AsyncHandler | undefined;

async function bootstrap(): Promise<AsyncHandler> {
  const app = await NestFactory.create(AppModule, {
    logger: new NestStandardLogger(serviceName),
  });
  const prefix = process.env.SERVICE_PREFIX ?? 'transactions';
  app.setGlobalPrefix(prefix);
  applySecuritySurface(app);
  applyGlobalValidation(app);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp }) as unknown as AsyncHandler;
}

export const handler: AsyncHandler = async (event, context) => {
  const logger = createLogger(serviceName, {
    requestId: context.awsRequestId,
    domain: serviceName,
    layer: 'infrastructure',
    operation: 'lambda_invoke',
  });
  if (!cachedServer) {
    logger.info('lambda.cold_start', { coldStart: true });
    cachedServer = await bootstrap();
  }
  return cachedServer(event, context);
};
