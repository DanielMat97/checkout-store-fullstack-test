"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
const SENSITIVE_KEYS = [
    'pan',
    'cvv',
    'cvc',
    'cardNumber',
    'card_number',
    'password',
    'authorization',
    'privateKey',
    'private_key',
    'secret',
];
function redact(value) {
    if (Array.isArray(value)) {
        return value.map(redact);
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
                out[key] = '[REDACTED]';
            }
            else {
                out[key] = redact(nested);
            }
        }
        return out;
    }
    return value;
}
function write(level, service, message, data, meta) {
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        service,
        message,
        correlationId: meta?.correlationId,
        requestId: meta?.requestId,
        data: data ? redact(data) : undefined,
    };
    const line = JSON.stringify(payload);
    if (level === 'error') {
        process.stderr.write(`${line}\n`);
    }
    else {
        process.stdout.write(`${line}\n`);
    }
}
function createLogger(service, meta) {
    return {
        debug: (message, data) => write('debug', service, message, data, meta),
        info: (message, data) => write('info', service, message, data, meta),
        warn: (message, data) => write('warn', service, message, data, meta),
        error: (message, data) => write('error', service, message, data, meta),
    };
}
//# sourceMappingURL=logger.js.map