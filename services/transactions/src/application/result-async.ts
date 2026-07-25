import { err, ok, ResultAsync, type Result } from 'neverthrow';
import type { DomainError } from '../domain/errors';

type PersistLike = {
  type: string;
  entity?: string;
  id?: string;
  message?: string;
  productId?: string;
  stock?: number;
};

export function mapPersistence(error: PersistLike): DomainError {
  if (error.type === 'NOT_FOUND') {
    return {
      type: 'NOT_FOUND',
      entity: error.entity ?? 'unknown',
      id: error.id ?? '',
    };
  }
  if (error.type === 'INSUFFICIENT_STOCK') {
    return {
      type: 'INSUFFICIENT_STOCK',
      productId: error.productId ?? '',
      stock: error.stock ?? 0,
    };
  }
  return {
    type: 'PERSISTENCE_ERROR',
    message: error.message ?? 'Persistence error',
  };
}

/** Lift `Promise<Result<T, PersistLike>>` into a DomainError railway. */
export function fromRepoResult<T>(
  promise: Promise<Result<T, PersistLike>>,
): ResultAsync<T, DomainError> {
  return ResultAsync.fromSafePromise(promise).andThen((result) =>
    result.isOk() ? ok(result.value) : err(mapPersistence(result.error)),
  );
}
