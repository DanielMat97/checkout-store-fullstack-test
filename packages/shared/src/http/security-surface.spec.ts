import type { INestApplication } from '@nestjs/common';
import { applySecuritySurface } from './security-surface';

describe('applySecuritySurface', () => {
  it('disables x-powered-by and registers header middleware', () => {
    const disable = jest.fn();
    const use = jest.fn();
    const app = {
      getHttpAdapter: () => ({
        getInstance: () => ({ disable, use }),
      }),
    } as unknown as INestApplication;

    applySecuritySurface(app);

    expect(disable).toHaveBeenCalledWith('x-powered-by');
    expect(use).toHaveBeenCalledWith(expect.any(Function));

    const middleware = use.mock.calls[0][0] as (
      req: unknown,
      res: { setHeader: jest.Mock; removeHeader: jest.Mock },
      next: jest.Mock,
    ) => void;
    const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
    const next = jest.fn();
    middleware({}, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(next).toHaveBeenCalled();
  });
});
