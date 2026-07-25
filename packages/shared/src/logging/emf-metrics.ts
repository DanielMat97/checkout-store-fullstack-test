/**
 * CloudWatch Embedded Metric Format (EMF) — one line → custom metrics.
 * Namespace: Checkout/API
 */
export type EmfStatusClass = '2xx' | '3xx' | '4xx' | '5xx' | 'other';

export function emitHttpEmf(input: {
  service: string;
  stage: string;
  statusClass: EmfStatusClass;
  durationMs: number;
  statusCode: number;
}): void {
  const payload = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: 'Checkout/API',
          Dimensions: [['Service', 'Stage', 'StatusClass']],
          Metrics: [
            { Name: 'RequestCount', Unit: 'Count' },
            { Name: 'LatencyMs', Unit: 'Milliseconds' },
            { Name: 'HttpStatus', Unit: 'None' },
          ],
        },
      ],
    },
    Service: input.service,
    Stage: input.stage,
    StatusClass: input.statusClass,
    RequestCount: 1,
    LatencyMs: input.durationMs,
    HttpStatus: input.statusCode,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export function statusClassOf(statusCode: number): EmfStatusClass {
  if (statusCode >= 500) return '5xx';
  if (statusCode >= 400) return '4xx';
  if (statusCode >= 300) return '3xx';
  if (statusCode >= 200) return '2xx';
  return 'other';
}
