import { Injectable, NestMiddleware, Type, mixin } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { logHttpRequest, newCorrelationId } from '../logging/http-request';

/**
 * Nest middleware factory: emits the same JSON access logs as `createLogger`
 * (`service: "api-gateway"`, `message: "http.request"`).
 */
export function AccessLogMiddleware(targetService: string): Type<NestMiddleware> {
  @Injectable()
  class AccessLogMiddlewareHost implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
      const started = Date.now();
      const correlationId =
        (req.headers['x-correlation-id'] as string | undefined) ?? newCorrelationId();
      const requestId =
        (req.headers['x-request-id'] as string | undefined) ??
        (req.headers['x-amzn-requestid'] as string | undefined);

      req.headers['x-correlation-id'] = correlationId;
      res.setHeader('x-correlation-id', correlationId);

      res.on('finish', () => {
        const rawLen = req.headers['content-length'];
        const contentLength =
          typeof rawLen === 'string' && rawLen !== '' ? Number(rawLen) : undefined;
        logHttpRequest({
          service: 'api-gateway',
          method: req.method,
          path: req.originalUrl || req.url,
          statusCode: res.statusCode,
          durationMs: Date.now() - started,
          correlationId,
          requestId,
          targetService: targetService,
          userAgent:
            typeof req.headers['user-agent'] === 'string'
              ? req.headers['user-agent']
              : undefined,
          contentLength: Number.isFinite(contentLength) ? contentLength : undefined,
        });
      });

      next();
    }
  }

  return mixin(AccessLogMiddlewareHost);
}
