import { getSecurityHeaders } from './headers';

describe('getSecurityHeaders', () => {
  it('includes HSTS and nosniff', () => {
    const headers = getSecurityHeaders();
    expect(headers['Strict-Transport-Security']).toContain('max-age=');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Cache-Control']).toBe('no-store');
    expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
    expect(headers['Content-Security-Policy']).toContain("object-src 'none'");
  });
});
