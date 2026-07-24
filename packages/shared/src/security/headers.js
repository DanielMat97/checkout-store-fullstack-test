"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecurityHeaders = getSecurityHeaders;
/** Apply on every API response (OWASP-oriented defaults). */
function getSecurityHeaders() {
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
//# sourceMappingURL=headers.js.map