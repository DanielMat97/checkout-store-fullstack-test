import type { NextFunction, Request, Response } from 'express';
import { logHttpRequest, newCorrelationId } from '../logging/http-request';

/**
 * Edge-style access log emitted by each Lambda behind the Serverless HTTP API.
 * `service` is always `api-gateway` so CloudWatch/local logs share one stream shape;
 * `targetService` identifies the Nest microservice that handled the route.
 */
export function createAccessLogMiddleware(targetService: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const started = Date.now();
    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ??
      newCorrelationId();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    res.on('finish', () => {
      logHttpRequest({
        service: 'api-gateway',
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - started,
        correlationId,
        targetService,
      });
    });

    next();
  };
}
