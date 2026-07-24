import type { Handler } from 'aws-lambda';
import { createLogger } from '@app/shared';

/**
 * Lambda entry — wire Nest + @codegenie/serverless-express at deploy time (ADR 0003).
 * Local HTTP uses `main.ts` / `nest start`.
 */
export const handler: Handler = async () => {
  const logger = createLogger(process.env.SERVICE_NAME ?? 'api');
  logger.error('lambda.not_wired', {
    hint: 'Bootstrap Nest with serverless-express before deploying',
  });
  return {
    statusCode: 501,
    body: JSON.stringify({ message: 'Lambda handler not wired yet' }),
  };
};
