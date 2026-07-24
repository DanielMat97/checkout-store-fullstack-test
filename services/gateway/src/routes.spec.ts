import { resolveTarget } from './routes';

describe('resolveTarget', () => {
  it('maps /products/health to products service', () => {
    const hit = resolveTarget('/products/health');
    expect(hit?.route.name).toBe('products');
    expect(hit?.upstreamPath).toBe('/products/health');
  });

  it('returns null for unknown prefix', () => {
    expect(resolveTarget('/unknown')).toBeNull();
  });
});
