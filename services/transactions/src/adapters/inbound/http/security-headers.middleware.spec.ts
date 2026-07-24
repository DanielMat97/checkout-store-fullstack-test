import { SecurityHeadersMiddleware } from './security-headers.middleware';
import type { NextFunction, Request, Response } from 'express';

describe('SecurityHeadersMiddleware', () => {
  it('applies shared security headers and strips X-Powered-By', () => {
    const middleware = new SecurityHeadersMiddleware();
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (k: string, v: string) => {
        headers[k] = v;
      },
      removeHeader: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;
    middleware.use({} as Request, res, next);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(next).toHaveBeenCalled();
  });
});
