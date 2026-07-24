import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, type Logger } from '../logging/logger';

/** Nest `LoggerService` backed by the shared JSON `createLogger` facade. */
@Injectable()
export class NestStandardLogger implements LoggerService {
  private readonly logger: Logger;

  constructor(service: string) {
    this.logger = createLogger(service);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info(stringify(message), contextData(optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    const [trace, context] = optionalParams;
    this.logger.error(stringify(message), {
      ...contextData([context]),
      trace: trace != null ? stringify(trace) : undefined,
    });
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn(stringify(message), contextData(optionalParams));
  }

  debug?(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(stringify(message), contextData(optionalParams));
  }

  verbose?(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(stringify(message), {
      ...contextData(optionalParams),
      verbose: true,
    });
  }
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function contextData(optionalParams: unknown[]): Record<string, unknown> | undefined {
  const context = optionalParams[0];
  if (context == null) return undefined;
  return { context: stringify(context) };
}
