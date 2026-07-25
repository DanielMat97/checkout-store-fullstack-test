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

  it('records contentLength and classifies 3xx / other statuses', () => {
    resetColdStartForTests(false);
    logHttpRequest({
      method: 'GET',
      path: '/redirect',
      statusCode: 302,
      durationMs: 2,
      correlationId: 'c',
      contentLength: 42,
    });
    expect(writes.some((w) => w.includes('"statusClass":"3xx"'))).toBe(true);
    expect(writes.some((w) => w.includes('"contentLength":42'))).toBe(true);

    writes.length = 0;
    logHttpRequest({
      method: 'GET',
      path: '/odd',
      statusCode: 100,
      durationMs: 1,
      correlationId: 'c',
    });
    expect(writes.some((w) => w.includes('"statusClass":"other"'))).toBe(true);
  });
});

describe('normalizeRoute', () => {
  it('replaces entity ids', () => {
    expect(normalizeRoute('/transactions/tx_abc-123/pay')).toBe(
      '/transactions/:transactionId/pay',
    );
    expect(normalizeRoute('/deliveries/del_xyz/status')).toBe(
      '/deliveries/:deliveryId/status',
    );
    expect(normalizeRoute('/customers/cus_1')).toBe('/customers/:customerId');
    expect(normalizeRoute('/items/550e8400-e29b-41d4-a716-446655440000')).toBe(
      '/items/:uuid',
    );
  });
});
