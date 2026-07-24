export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  service: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

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

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redact(nested);
      }
    }
    return out;
  }
  return value;
}

function write(
  level: LogLevel,
  service: string,
  message: string,
  data?: Record<string, unknown>,
  meta?: { correlationId?: string; requestId?: string },
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    correlationId: meta?.correlationId,
    requestId: meta?.requestId,
    data: data ? (redact(data) as Record<string, unknown>) : undefined,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export function createLogger(
  service: string,
  meta?: { correlationId?: string; requestId?: string },
): Logger {
  return {
    debug: (message, data) => write('debug', service, message, data, meta),
    info: (message, data) => write('info', service, message, data, meta),
    warn: (message, data) => write('warn', service, message, data, meta),
    error: (message, data) => write('error', service, message, data, meta),
  };
}
