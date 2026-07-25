import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { getSecurityHeaders } from '../security/headers';

/**
 * Apply OWASP-oriented headers + strip Express fingerprint on the HTTP adapter.
 * Call after NestFactory.create (Lambda and local bootstrap).
 */
export function applySecuritySurface(app: INestApplication): void {
  const http = app.getHttpAdapter().getInstance() as {
    disable?: (name: string) => void;
    use?: (...args: unknown[]) => void;
  };

  http.disable?.('x-powered-by');
  http.use?.((req: Request, res: Response, next: NextFunction) => {
    for (const [key, value] of Object.entries(getSecurityHeaders())) {
      res.setHeader(key, value);
    }
    res.removeHeader('X-Powered-By');
    next();
  });
}
