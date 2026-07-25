import { NestStandardLogger } from './nest-logger';

describe('NestStandardLogger', () => {
  const writes: string[] = [];
  let originalOut: typeof process.stdout.write;
  let originalErr: typeof process.stderr.write;

  beforeEach(() => {
    writes.length = 0;
    originalOut = process.stdout.write.bind(process.stdout);
    originalErr = process.stderr.write.bind(process.stderr);
    const capture = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    process.stdout.write = capture;
    process.stderr.write = capture;
  });

  afterEach(() => {
    process.stdout.write = originalOut;
    process.stderr.write = originalErr;
  });

  it('maps Nest log levels onto createLogger', () => {
    const logger = new NestStandardLogger('products');
    logger.log('hello', 'Ctx');
    logger.warn({ a: 1 }, 'Ctx');
    logger.debug?.('dbg');
    logger.verbose?.('verb', 'V');
    logger.error('boom', 'stack-trace', 'ErrCtx');

    expect(writes.some((w) => w.includes('"level":"info"') && w.includes('hello'))).toBe(
      true,
    );
    expect(writes.some((w) => w.includes('"level":"warn"'))).toBe(true);
    expect(writes.some((w) => w.includes('"level":"debug"'))).toBe(true);
    expect(writes.some((w) => w.includes('"verbose":true'))).toBe(true);
    expect(
      writes.some((w) => w.includes('"level":"error"') && w.includes('stack-trace')),
    ).toBe(true);
  });

  it('stringifies circular values safely', () => {
    const logger = new NestStandardLogger('api');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    logger.log(circular);
    expect(writes[0]).toContain('[object Object]');
  });

  it('errors without a stack trace omit the trace field', () => {
    const logger = new NestStandardLogger('api');
    logger.error('oops');
    const line = writes.find((w) => w.includes('"level":"error"'));
    expect(line).toBeDefined();
    expect(line).not.toContain('"trace"');
  });
});
