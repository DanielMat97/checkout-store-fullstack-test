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

/**
 * API access log — same envelope as every other app log (`createLogger`).
 * Always uses message key `http.request`.
 */
export function logHttpRequest(input: HttpRequestLogInput): void {
  const service = input.service ?? 'api-gateway';
  const logger = createLogger(service, {
    correlationId: input.correlationId,
    requestId: input.requestId,
  });

  const data: Record<string, unknown> = {
    channel: 'http',
    method: input.method,
    path: input.path,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
  };
  if (input.targetService) data.targetService = input.targetService;
  if (input.errorMessage) data.errorMessage = input.errorMessage;

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
