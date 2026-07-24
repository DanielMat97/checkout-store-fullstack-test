import { newCorrelationId, logHttpRequest } from './http-request';

describe('logHttpRequest', () => {
  it('emits structured gateway access log', () => {
    const writes: string[] = [];
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: string | Uint8Array) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;

    logHttpRequest({
      method: 'GET',
      path: '/products/health',
      statusCode: 200,
      durationMs: 12,
      correlationId: newCorrelationId(),
      targetService: 'products',
    });

    process.stdout.write = original;
    expect(writes[0]).toContain('"service":"api-gateway"');
    expect(writes[0]).toContain('"message":"http.request"');
    expect(writes[0]).toContain('"channel":"http"');
    expect(writes[0]).toContain('/products/health');
  });
});
