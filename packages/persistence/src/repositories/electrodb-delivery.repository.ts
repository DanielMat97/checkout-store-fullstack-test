import { err, ok, type Result } from 'neverthrow';
import type { CheckoutEntities } from '../entities';
import type { DeliveryRecord, PersistenceError } from '../types';
import type { DeliveryRepositoryPort } from '../ports/repositories';

function mapPersistenceError(error: unknown): PersistenceError {
  const message = error instanceof Error ? error.message : String(error);
  return { type: 'PERSISTENCE_ERROR', message };
}

function toRecord(data: {
  deliveryId: string;
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  feeMinor: number;
  status: DeliveryRecord['status'];
}): DeliveryRecord {
  return {
    id: data.deliveryId,
    transactionId: data.transactionId,
    customerId: data.customerId,
    address: data.address,
    city: data.city,
    region: data.region,
    feeMinor: data.feeMinor,
    status: data.status,
  };
}

export class ElectroDbDeliveryRepository implements DeliveryRepositoryPort {
  constructor(private readonly entities: CheckoutEntities) {}

  async getById(id: string): Promise<Result<DeliveryRecord, PersistenceError>> {
    try {
      const result = await this.entities.deliveries.get({ deliveryId: id }).go();
      if (!result.data) {
        return err({ type: 'NOT_FOUND', entity: 'delivery', id });
      }
      return ok(toRecord(result.data));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async put(delivery: DeliveryRecord): Promise<Result<DeliveryRecord, PersistenceError>> {
    try {
      await this.entities.deliveries
        .put({
          deliveryId: delivery.id,
          transactionId: delivery.transactionId,
          customerId: delivery.customerId,
          address: delivery.address,
          city: delivery.city,
          region: delivery.region,
          feeMinor: delivery.feeMinor,
          status: delivery.status,
        })
        .go();
      return ok(delivery);
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async listByTransaction(
    transactionId: string,
  ): Promise<Result<DeliveryRecord[], PersistenceError>> {
    try {
      const result = await this.entities.deliveries.query
        .byTransaction({ transactionId })
        .go();
      return ok(result.data.map(toRecord));
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }
}
