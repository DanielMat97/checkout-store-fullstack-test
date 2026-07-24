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
export declare function createLogger(service: string, meta?: {
    correlationId?: string;
    requestId?: string;
}): Logger;
//# sourceMappingURL=logger.d.ts.map