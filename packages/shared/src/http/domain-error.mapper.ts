import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

/** Shared shape for Nest inbound adapters across domains. */
export type HttpDomainError =
  | { type: 'NOT_FOUND'; id: string; entity?: string }
  | { type: 'INSUFFICIENT_STOCK'; productId: string; stock: number }
  | { type: 'INVALID_STATE'; message: string }
  | { type: 'VALIDATION'; message: string }
  | { type: 'PAYMENT_FAILED'; message: string }
  | { type: 'PERSISTENCE_ERROR'; message: string }
  | { type: string; message?: string; id?: string; entity?: string; [key: string]: unknown };

/** Inbound adapter: domain Result errors → HTTP. No business rules here. */
export function domainErrorToHttp(error: HttpDomainError): HttpException {
  switch (error.type) {
    case 'NOT_FOUND':
      return new NotFoundException({
        error: error.type,
        entity: error.entity ?? 'resource',
        id: error.id ?? '',
      });
    case 'INSUFFICIENT_STOCK':
      return new ConflictException({
        error: error.type,
        productId: error.productId,
        stock: error.stock,
      });
    case 'INVALID_STATE':
      return new UnprocessableEntityException({
        error: error.type,
        message: error.message,
      });
    case 'VALIDATION':
      return new BadRequestException({
        error: error.type,
        message: error.message,
      });
    case 'PAYMENT_FAILED':
      return new HttpException(
        { error: error.type, message: error.message },
        502,
      );
    case 'PERSISTENCE_ERROR':
      return new HttpException(
        { error: 'PERSISTENCE_ERROR', message: error.message },
        500,
      );
    default: {
      const message =
        'message' in error && typeof error.message === 'string'
          ? error.message
          : 'Unexpected error';
      return new HttpException({ error: error.type, message }, 500);
    }
  }
}
