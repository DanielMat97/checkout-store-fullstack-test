import { createLogger, createApplicationLogger } from './logger';

describe('createLogger', () => {
  const writes: { stream: 'out' | 'err'; chunk: string }[] = [];
  let originalOut: typeof process.stdout.write;
  let originalErr: typeof process.stderr.write;

  beforeEach(() => {
    writes.length = 0;
    process.env.STAGE = 'test';
    originalOut = process.stdout.write.bind(process.stdout);
    originalErr = process.stderr.write.bind(process.stderr);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push({ stream: 'out', chunk: String(chunk) });
      return true;
    }) as typeof process.stdout.write;
    process.stderr.write = ((chunk: string | Uint8Array) => {
      writes.push({ stream: 'err', chunk: String(chunk) });
      return true;
    }) as typeof process.stderr.write;
  });

  afterEach(() => {
    process.stdout.write = originalOut;
    process.stderr.write = originalErr;
    delete process.env.STAGE;
  });

  it('redacts sensitive card fields from data', () => {
    const logger = createLogger('products');
    logger.info('test.event', { cardNumber: '4111111111111111', last4: '1111' });
    expect(writes[0].chunk).toContain('[REDACTED]');
    expect(writes[0].chunk).not.toContain('4111111111111111');
    expect(writes[0].chunk).toContain('1111');
    expect(writes[0].chunk).toContain('"service":"products"');
    expect(writes[0].chunk).toContain('"stage":"test"');
  });

  it('writes debug/warn to stdout and error to stderr', () => {
    const logger = createLogger('api', { correlationId: 'c1', requestId: 'r1' });
    logger.debug('d');
    logger.warn('w');
    logger.error('e', { nested: [{ password: 'x' }] });
    expect(
      writes.some((w) => w.stream === 'out' && w.chunk.includes('"level":"debug"')),
    ).toBe(true);
    expect(
      writes.some((w) => w.stream === 'out' && w.chunk.includes('"level":"warn"')),
    ).toBe(true);
    expect(
      writes.some((w) => w.stream === 'err' && w.chunk.includes('"level":"error"')),
    ).toBe(true);
    expect(writes.find((w) => w.stream === 'err')?.chunk).toContain('[REDACTED]');
    expect(writes.find((w) => w.stream === 'err')?.chunk).toContain(
      '"correlationId":"c1"',
    );
  });

  it('child logger merges domain/layer/operation', () => {
    const logger = createApplicationLogger('transactions', 'pay_transaction', {
      correlationId: 'c2',
    });
    logger.info('pay.outcome', { paymentStatus: 'APPROVED' });
    const line = writes[0].chunk;
    expect(line).toContain('"layer":"application"');
    expect(line).toContain('"operation":"pay_transaction"');
    expect(line).toContain('"domain":"transactions"');
    expect(line).toContain('"correlationId":"c2"');
  });

  it('child() inherits ids', () => {
    const root = createLogger('deliveries', { requestId: 'r9' });
    root.child({ layer: 'adapter', operation: 'put_delivery' }).info('saved');
    expect(writes[0].chunk).toContain('"requestId":"r9"');
    expect(writes[0].chunk).toContain('"layer":"adapter"');
  });

  it('includes Lambda runtime context when env is set', () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'checkout-api-prod-products';
    process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs20.x';
    process.env.SERVICE_NAME = 'products';
    createLogger('products').info('boot');
    const line = writes[0].chunk;
    expect(line).toContain('"functionName":"checkout-api-prod-products"');
    expect(line).toContain('"runtime":"AWS_Lambda_nodejs20.x"');
    expect(line).toContain('"serviceNameEnv":"products"');
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.AWS_EXECUTION_ENV;
    delete process.env.SERVICE_NAME;
  });

  it('falls back to NODE_ENV when STAGE is unset', () => {
    delete process.env.STAGE;
    process.env.NODE_ENV = 'development';
    createLogger('api').info('local');
    expect(writes[0].chunk).toContain('"stage":"development"');
    delete process.env.NODE_ENV;
  });
});
