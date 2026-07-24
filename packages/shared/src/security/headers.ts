export interface SecurityHeaders {
  [header: string]: string;
}

/** Apply on every API response (OWASP-oriented defaults). */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store',
  };
}
