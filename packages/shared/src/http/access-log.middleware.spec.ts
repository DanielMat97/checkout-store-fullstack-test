import { AccessLogMiddleware } from './access-log.middleware';
import type { NextFunction, Request, Response } from 'express';

describe('AccessLogMiddleware', () => {
  it('sets correlation id and logs on finish', () => {
    const writes: string[] = [];
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;

    const Middleware = AccessLogMiddleware('products');
    const instance = new Middleware();

    const headers: Record<string, string> = {};
    const req = {
      method: 'GET',
      url: '/products',
      originalUrl: '/products',
      headers,
    } as unknown as Request;

    let finish: (() => void) | undefined;
    const res = {
      statusCode: 200,
      setHeader: jest.fn(),
      on: (event: string, cb: () => void) => {
        if (event === 'finish') finish = cb;
      },
    } as unknown as Response;

    const next = jest.fn() as NextFunction;
    instance.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(headers['x-correlation-id']).toMatch(/^corr_/);
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      headers['x-correlation-id'],
    );

    finish?.();
    process.stdout.write = original;

    expect(writes.some((w) => w.includes('http.request'))).toBe(true);
    expect(writes.some((w) => w.includes('"targetService":"products"'))).toBe(true);
  });

  it('reuses inbound correlation and request ids', () => {
    const Middleware = AccessLogMiddleware('customers');
    const instance = new Middleware();
    const headers: Record<string, string | undefined> = {
      'x-correlation-id': 'corr_fixed',
      'x-request-id': 'req_fixed',
    };
    const req = {
      method: 'POST',
      url: '/customers',
      headers,
    } as unknown as Request;
    const res = {
      statusCode: 201,
      setHeader: jest.fn(),
      on: jest.fn(),
    } as unknown as Response;

    instance.use(req, res, jest.fn());
    expect(headers['x-correlation-id']).toBe('corr_fixed');
  });
});
