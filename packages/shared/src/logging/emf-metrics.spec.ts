import { emitHttpEmf, statusClassOf } from './emf-metrics';

describe('statusClassOf', () => {
  it('buckets status codes', () => {
    expect(statusClassOf(500)).toBe('5xx');
    expect(statusClassOf(404)).toBe('4xx');
    expect(statusClassOf(301)).toBe('3xx');
    expect(statusClassOf(201)).toBe('2xx');
    expect(statusClassOf(100)).toBe('other');
  });
});

describe('emitHttpEmf', () => {
  it('writes Checkout/API EMF line to stdout', () => {
    const writes: string[] = [];
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;

    emitHttpEmf({
      service: 'products',
      stage: 'test',
      statusClass: '2xx',
      durationMs: 9,
      statusCode: 200,
    });
    process.stdout.write = original;

    expect(writes[0]).toContain('Checkout/API');
    expect(writes[0]).toContain('"Service":"products"');
    expect(writes[0]).toContain('"LatencyMs":9');
  });
});
