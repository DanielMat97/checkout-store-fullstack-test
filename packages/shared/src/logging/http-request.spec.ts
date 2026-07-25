import { newCorrelationId, logHttpRequest, normalizeRoute } from './http-request';
import { resetColdStartForTests } from './cold-start';

describe('logHttpRequest', () => {
  const writes: string[] = [];
  let original: typeof process.stdout.write;
  let originalErr: typeof process.stderr.write;

  beforeEach(() => {
    writes.length = 0;
    resetColdStartForTests(true);
    process.env.STAGE = 'test';
    original = process.stdout.write.bind(process.stdout);
    originalErr = process.stderr.write.bind(process.stderr);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    process.stderr.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
  });

  afterEach(() => {
    process.stdout.write = original;
    process.stderr.write = originalErr;
    delete process.env.STAGE;
  });

  it('emits structured gateway access log + EMF', () => {
    logHttpRequest({
      method: 'GET',
      path: '/products/prod_aura_quiet/stock?x=1',
      statusCode: 200,
      durationMs: 12,
      correlationId: newCorrelationId(),
      targetService: 'products',
      userAgent: 'jest',
    });

    const access = writes.find((w) => w.includes('"message":"http.request"'));
    expect(access).toBeDefined();
    expect(access).toContain('"service":"api-gateway"');
    expect(access).toContain('"channel":"http"');
    expect(access).toContain('"statusClass":"2xx"');
    expect(access).toContain('"route":"/products/:productId/stock"');
    expect(access).toContain('"coldStart":true');
    expect(access).toContain('"hasQuery":true');
    expect(writes.some((w) => w.includes('Checkout/API'))).toBe(true);
  });

  it('warns on 4xx and errors on 5xx', () => {
    resetColdStartForTests(false);
    logHttpRequest({
      method: 'GET',
      path: '/x',
      statusCode: 404,
      durationMs: 1,
      correlationId: 'c',
      targetService: 'products',
    });
    expect(writes.some((w) => w.includes('"level":"warn"'))).toBe(true);

    logHttpRequest({
      method: 'GET',
      path: '/x',
      statusCode: 500,
      durationMs: 1,
      correlationId: 'c',
      targetService: 'products',
      errorMessage: 'boom',
    });
    expect(writes.some((w) => w.includes('"level":"error"'))).toBe(true);
  });
});

describe('normalizeRoute', () => {
  it('replaces entity ids', () => {
    expect(normalizeRoute('/transactions/tx_abc-123/pay')).toBe(
      '/transactions/:transactionId/pay',
    );
  });
});
