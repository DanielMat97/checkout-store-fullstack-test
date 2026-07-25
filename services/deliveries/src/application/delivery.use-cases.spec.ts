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

  it('UpdateDeliveryStatus covers validation, not-found, invalid state, cancel, put errors', async () => {
    const update = new UpdateDeliveryStatusUseCase(repo);
    expect((await update.execute('x', 'PENDING'))._unsafeUnwrapErr().type).toBe(
      'VALIDATION',
    );
    expect((await update.execute('missing', 'FULFILLED'))._unsafeUnwrapErr().type).toBe(
      'NOT_FOUND',
    );

    const created = await create.execute({
      transactionId: 'tx_u',
      customerId: 'cust_1',
      address: 'Calle 1',
      city: 'Bogotá',
      region: 'Cundinamarca',
      feeMinor: 5000,
    });
    const id = created._unsafeUnwrap().id;
    expect((await update.execute(id, 'FULFILLED'))._unsafeUnwrapErr().type).toBe(
      'INVALID_STATE',
    );

    const cancelled = await update.execute(id, 'CANCELLED');
    expect(cancelled.isOk()).toBe(true);
    expect(cancelled._unsafeUnwrap().status).toBe('CANCELLED');

    const failingGet: DeliveryRepositoryPort = {
      getById: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
      put: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
      listByTransaction: async () => err({ type: 'PERSISTENCE_ERROR', message: 'down' }),
    };
    expect(
      (
        await new UpdateDeliveryStatusUseCase(failingGet).execute('x', 'FULFILLED')
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');

    const failingPut: DeliveryRepositoryPort = {
      getById: async (delId) =>
        ok({
          id: delId,
          transactionId: 't',
          customerId: 'c',
          address: 'a',
          city: 'b',
          region: 'r',
          feeMinor: 1,
          status: 'FULFILLABLE',
        }),
      put: async () => err({ type: 'NOT_FOUND', entity: 'delivery', id: 'x' }),
      listByTransaction: async () => ok([]),
    };
    expect(
      (
        await new UpdateDeliveryStatusUseCase(failingPut).execute('d1', 'FULFILLED')
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');

    const weirdGet: DeliveryRepositoryPort = {
      getById: async () =>
        err({ type: 'INSUFFICIENT_STOCK', productId: 'p', stock: 0, requested: 1 }),
      put: async () => err({ type: 'PERSISTENCE_ERROR', message: 'x' }),
      listByTransaction: async () => ok([]),
    };
    const weirdResult = await new UpdateDeliveryStatusUseCase(weirdGet).execute(
      'x',
      'CANCELLED',
    );
    expect(weirdResult.isErr() && weirdResult.error.type).toBe('PERSISTENCE_ERROR');
    if (weirdResult.isErr() && weirdResult.error.type === 'PERSISTENCE_ERROR') {
      expect(weirdResult.error.message).toBe('INSUFFICIENT_STOCK');
    }
  });
});
