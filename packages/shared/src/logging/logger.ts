export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Hex / Nest layer for filtering in CloudWatch Logs Insights. */
export type LogLayer = 'http' | 'application' | 'domain' | 'adapter' | 'infrastructure';

export interface LogFields {
  service: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

export interface LoggerMeta {
  correlationId?: string;
  requestId?: string;
  /** Bounded context: products | customers | deliveries | transactions | … */
  domain?: string;
  layer?: LogLayer;
  /** Use-case / handler operation key e.g. pay_transaction */
  operation?: string;
}

export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
  /** Child logger that merges domain/layer/operation/ids. */
  child: (meta: LoggerMeta) => Logger;
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

function runtimeContext(): Record<string, unknown> {
  const ctx: Record<string, unknown> = {
    stage: process.env.STAGE || process.env.NODE_ENV || 'local',
  };
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    ctx.functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
  }
  if (process.env.AWS_EXECUTION_ENV) {
    ctx.runtime = process.env.AWS_EXECUTION_ENV;
  }
  if (process.env.SERVICE_NAME) {
    ctx.serviceNameEnv = process.env.SERVICE_NAME;
  }
  return ctx;
}

function write(
  level: LogLevel,
  service: string,
  message: string,
  data?: Record<string, unknown>,
  meta?: LoggerMeta,
): void {
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    ...runtimeContext(),
    correlationId: meta?.correlationId,
    requestId: meta?.requestId,
    domain: meta?.domain ?? service,
    layer: meta?.layer,
    operation: meta?.operation,
    data: data ? (redact(data) as Record<string, unknown>) : undefined,
  };
  // Drop undefined keys for cleaner Insights filters
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }
  const line = JSON.stringify(payload);
  if (level === 'error') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

export function createLogger(service: string, meta?: LoggerMeta): Logger {
  const base: LoggerMeta = { ...meta };
  const api: Logger = {
    debug: (message, data) => write('debug', service, message, data, base),
    info: (message, data) => write('info', service, message, data, base),
    warn: (message, data) => write('warn', service, message, data, base),
    error: (message, data) => write('error', service, message, data, base),
    child: (childMeta) =>
      createLogger(service, {
        ...base,
        ...childMeta,
        correlationId: childMeta.correlationId ?? base.correlationId,
        requestId: childMeta.requestId ?? base.requestId,
      }),
  };
  return api;
}

/** Convenience: application-layer logger for a domain use-case. */
export function createApplicationLogger(
  domain: string,
  operation: string,
  meta?: Omit<LoggerMeta, 'domain' | 'layer' | 'operation'>,
): Logger {
  return createLogger(domain, {
    ...meta,
    domain,
    layer: 'application',
    operation,
  });
}
