import { createLogger } from './logger';
import { isColdStart, markWarm } from './cold-start';
import { emitHttpEmf, statusClassOf } from './emf-metrics';

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
  userAgent?: string;
  contentLength?: number;
}

/**
 * Collapse high-cardinality ids in paths for Insights / dashboards.
 */
export function normalizeRoute(path: string): string {
  const bare = path.split('?')[0] || '/';
  return bare
    .replace(/\/tx_[a-zA-Z0-9-]+/g, '/:transactionId')
    .replace(/\/del_[a-zA-Z0-9-]+/g, '/:deliveryId')
    .replace(/\/cus_[a-zA-Z0-9-]+/g, '/:customerId')
    .replace(/\/prod_[a-zA-Z0-9_]+/g, '/:productId')
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:uuid',
    );
}

/**
 * API access log — same envelope as every other app log (`createLogger`).
 * Always uses message key `http.request`. Also emits EMF metrics.
 */
export function logHttpRequest(input: HttpRequestLogInput): void {
  const service = input.service ?? 'api-gateway';
  const target = input.targetService ?? 'unknown';
  const stage = process.env.STAGE || process.env.NODE_ENV || 'local';
  const statusClass = statusClassOf(input.statusCode);
  const cold = isColdStart();
  if (cold) markWarm();

  const logger = createLogger(service, {
    correlationId: input.correlationId,
    requestId: input.requestId,
    domain: target,
    layer: 'http',
    operation: 'http_request',
  });

  const route = normalizeRoute(input.path);
  const data: Record<string, unknown> = {
    channel: 'http',
    method: input.method,
    path: input.path.split('?')[0],
    route,
    statusCode: input.statusCode,
    statusClass,
    durationMs: input.durationMs,
    coldStart: cold,
    stage,
  };
  if (input.targetService) data.targetService = input.targetService;
  if (input.errorMessage) data.errorMessage = input.errorMessage;
  if (input.userAgent) data.userAgent = input.userAgent.slice(0, 120);
  if (input.contentLength != null && Number.isFinite(input.contentLength)) {
    data.contentLength = input.contentLength;
  }
  if (input.path.includes('?')) data.hasQuery = true;

  if (input.statusCode >= 500) {
    logger.error('http.request', data);
  } else if (input.statusCode >= 400) {
    logger.warn('http.request', data);
  } else {
    logger.info('http.request', data);
  }

  emitHttpEmf({
    service: target,
    stage,
    statusClass,
    durationMs: input.durationMs,
    statusCode: input.statusCode,
  });
}

export function newCorrelationId(): string {
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
