import { createLogger } from './logger';

describe('createLogger', () => {
  it('redacts sensitive card fields from data', () => {
    const writes: string[] = [];
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;

    const logger = createLogger('products');
    logger.info('test.event', { cardNumber: '4111111111111111', last4: '1111' });

    process.stdout.write = original;

    expect(writes[0]).toContain('[REDACTED]');
    expect(writes[0]).not.toContain('4111111111111111');
    expect(writes[0]).toContain('1111');
    expect(writes[0]).toContain('"service":"products"');
  });
});
