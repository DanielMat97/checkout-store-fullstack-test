import type {
  CustomerRepositoryPort,
  DeliveryRepositoryPort,
} from '@app/persistence';

export type CustomerReaderPort = Pick<CustomerRepositoryPort, 'getById'>;
export type DeliveryWriterPort = Pick<
  DeliveryRepositoryPort,
  'getById' | 'put'
>;
