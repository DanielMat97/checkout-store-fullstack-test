import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { NestStandardLogger, createLogger } from '@app/shared';

const serviceName = process.env.SERVICE_NAME ?? 'transactions';
let cachedServer: Handler | undefined;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, {
    logger: new NestStandardLogger(serviceName),
  });
  const prefix = process.env.SERVICE_PREFIX ?? 'transactions';
  app.setGlobalPrefix(prefix);
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: unknown,
  context: Context,
  callback: Callback,
) => {
  const logger = createLogger(serviceName);
  if (!cachedServer) {
    logger.info('lambda.cold_start');
    cachedServer = await bootstrap();
  }
  return cachedServer(event, context, callback);
};
