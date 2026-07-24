import type { ProductRepositoryPort } from '@app/persistence';

/** Subset used by transaction orchestration (same Dynamo table). */
export type ProductReaderPort = Pick<
  ProductRepositoryPort,
  'getById' | 'decrementStock'
>;
