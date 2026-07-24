import { createLogger } from './logger';

describe('createLogger', () => {
  const writes: { stream: 'out' | 'err'; chunk: string }[] = [];
  let originalOut: typeof process.stdout.write;
  let originalErr: typeof process.stderr.write;

  beforeEach(() => {
    writes.length = 0;
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
  });

  it('redacts sensitive card fields from data', () => {
    const logger = createLogger('products');
    logger.info('test.event', { cardNumber: '4111111111111111', last4: '1111' });
    expect(writes[0].chunk).toContain('[REDACTED]');
    expect(writes[0].chunk).not.toContain('4111111111111111');
    expect(writes[0].chunk).toContain('1111');
    expect(writes[0].chunk).toContain('"service":"products"');
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
});
