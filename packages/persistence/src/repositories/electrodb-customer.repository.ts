import { err, ok, type Result } from 'neverthrow';
import type { CheckoutEntities } from '../entities';
import type { CustomerRecord, PersistenceError } from '../types';
import type { CustomerRepositoryPort } from '../ports/repositories';

function mapPersistenceError(error: unknown): PersistenceError {
  const message = error instanceof Error ? error.message : String(error);
  return { type: 'PERSISTENCE_ERROR', message };
}

export class ElectroDbCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly entities: CheckoutEntities) {}

  async getById(
    id: string,
  ): Promise<Result<CustomerRecord, PersistenceError>> {
    try {
      const result = await this.entities.customers
        .get({ customerId: id })
        .go();
      if (!result.data) {
        return err({ type: 'NOT_FOUND', entity: 'customer', id });
      }
      return ok({
        id: result.data.customerId,
        fullName: result.data.fullName,
        email: result.data.email,
        phone: result.data.phone,
      });
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }

  async put(
    customer: CustomerRecord,
  ): Promise<Result<CustomerRecord, PersistenceError>> {
    try {
      await this.entities.customers
        .put({
          customerId: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        })
        .go();
      return ok(customer);
    } catch (error) {
      return err(mapPersistenceError(error));
    }
  }
}
