import { err, ok, type Result } from 'neverthrow';
import type {
  DeliveryRecord,
  DeliveryRepositoryPort,
  PersistenceError,
} from '@app/persistence';
import {
  CreateDeliveryUseCase,
  GetDeliveryUseCase,
  UpdateDeliveryStatusUseCase,
} from './delivery.use-cases';

class MemoryDeliveries implements DeliveryRepositoryPort {
  private readonly items = new Map<string, DeliveryRecord>();

  async getById(id: string): Promise<Result<DeliveryRecord, PersistenceError>> {
    const item = this.items.get(id);
    if (!item) {
      return err({ type: 'NOT_FOUND', entity: 'delivery', id });
    }
    return ok({ ...item });
  }

  async put(delivery: DeliveryRecord): Promise<Result<DeliveryRecord, PersistenceError>> {
    this.items.set(delivery.id, { ...delivery });
    return ok({ ...delivery });
  }

  async listByTransaction(
    transactionId: string,
  ): Promise<Result<DeliveryRecord[], PersistenceError>> {
    return ok(
      [...this.items.values()]
        .filter((d) => d.transactionId === transactionId)
        .map((d) => ({ ...d })),
    );
  }
}

describe('Delivery use-cases (ROP)', () => {
  const repo = new MemoryDeliveries();
  const get = new GetDeliveryUseCase(repo);
  const create = new CreateDeliveryUseCase(repo);

  it('creates and gets a delivery', async () => {
    const created = await create.execute({
      transactionId: 'tx_1',
      customerId: 'cust_1',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
      feeMinor: 5000,
    });
    expect(created.isOk()).toBe(true);
    const id = created._unsafeUnwrap().id;
    const loaded = await get.execute(id);
    expect(loaded.isOk()).toBe(true);
    expect(loaded._unsafeUnwrap().city).toBe('Bogotá');
  });

  it('returns typed NOT_FOUND', async () => {
    const result = await get.execute('missing');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });

  it('validates payload and maps persistence errors', async () => {
    expect(
      (
        await create.execute({
          transactionId: '',
          customerId: '',
          address: '',
          city: '',
          region: '',
          feeMinor: -1,
        })
      )._unsafeUnwrapErr().type,
    ).toBe('VALIDATION');

    const failing: DeliveryRepositoryPort = {
      getById: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
      put: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
      listByTransaction: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
    };
    expect(
      (
        await new CreateDeliveryUseCase(failing).execute({
          transactionId: 't',
          customerId: 'c',
          address: 'Calle 1',
          city: 'Bogotá',
          region: 'Cund',
          feeMinor: 1,
        })
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');
    expect(
      (await new GetDeliveryUseCase(failing).execute('x'))._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');
  });

  it('fulfills FULFILLABLE delivery', async () => {
    const created = await create.execute({
      transactionId: 'tx_f',
      customerId: 'cust_1',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
      feeMinor: 5000,
    });
    const id = created._unsafeUnwrap().id;
    await repo.put({ ...created._unsafeUnwrap(), status: 'FULFILLABLE' });
    const update = new UpdateDeliveryStatusUseCase(repo);
    const fulfilled = await update.execute(id, 'FULFILLED');
    expect(fulfilled.isOk()).toBe(true);
    expect(fulfilled._unsafeUnwrap().status).toBe('FULFILLED');
  });
});
