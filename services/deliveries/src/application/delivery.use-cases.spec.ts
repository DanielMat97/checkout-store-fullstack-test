import { err, ok, type Result } from 'neverthrow';
import type {
  DeliveryRecord,
  DeliveryRepositoryPort,
  PersistenceError,
} from '@app/persistence';
import { GetDeliveryUseCase } from './delivery.use-cases';

class MemoryDeliveries implements DeliveryRepositoryPort {
  private readonly items = new Map<string, DeliveryRecord>();

  seed(d: DeliveryRecord): void {
    this.items.set(d.id, { ...d });
  }

  async getById(
    id: string,
  ): Promise<Result<DeliveryRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'delivery', id });
    }
    return ok({ ...item });
  }

  async put(
    delivery: DeliveryRecord,
  ): Promise<Result<DeliveryRecord, PersistenceError>> {
    this.items.set(delivery.id, { ...delivery });
    return ok({ ...delivery });
  }
}

describe('GetDeliveryUseCase (ROP)', () => {
  const repo = new MemoryDeliveries();
  const get = new GetDeliveryUseCase(repo);

  it('returns delivery by id', async () => {
    repo.seed({
      id: 'del_1',
      transactionId: 'tx_1',
      customerId: 'cust_1',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
      feeMinor: 5000,
      status: 'PENDING',
    });
    const result = await get.execute('del_1');
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().city).toBe('Bogotá');
  });

  it('returns typed NOT_FOUND', async () => {
    const result = await get.execute('missing');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });
});
