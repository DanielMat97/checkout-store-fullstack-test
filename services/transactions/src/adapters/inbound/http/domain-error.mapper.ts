import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { DomainError } from '../../../domain/errors';

/** Inbound adapter: domain Result errors → HTTP. No business rules here. */
export function domainErrorToHttp(error: DomainError): HttpException {
  switch (error.type) {
    case 'NOT_FOUND':
      return new NotFoundException({
        error: error.type,
        entity: error.entity,
        id: error.id,
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
      return new HttpException({ error: error.type, message: error.message }, 502);
    case 'PERSISTENCE_ERROR':
    default:
      return new HttpException(
        { error: 'PERSISTENCE_ERROR', message: error.message },
        500,
      );
  }
}
