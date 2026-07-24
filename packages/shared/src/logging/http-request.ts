import { createLogger } from './logger';

export interface HttpRequestLogInput {
  service?: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  correlationId: string;
  requestId?: string;
  targetService?: string;
  errorMessage?: string;
}

/** Standardized access log for API Gateway / edge proxy. */
export function logHttpRequest(input: HttpRequestLogInput): void {
  const logger = createLogger(input.service ?? 'api-gateway', {
    correlationId: input.correlationId,
    requestId: input.requestId,
  });

  const data = {
    method: input.method,
    path: input.path,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
    targetService: input.targetService,
    errorMessage: input.errorMessage,
  };

  if (input.statusCode >= 500) {
    logger.error('http.request', data);
  } else if (input.statusCode >= 400) {
    logger.warn('http.request', data);
  } else {
    logger.info('http.request', data);
  }
}

export function newCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
