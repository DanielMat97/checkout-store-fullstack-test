import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getSecurityHeaders } from '@app/shared';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    for (const [key, value] of Object.entries(getSecurityHeaders())) {
      res.setHeader(key, value);
    }
    res.removeHeader('X-Powered-By');
    next();
  }
}
