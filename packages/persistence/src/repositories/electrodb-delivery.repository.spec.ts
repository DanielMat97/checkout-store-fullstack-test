import { ElectroDbDeliveryRepository } from './electrodb-delivery.repository';

describe('ElectroDbDeliveryRepository', () => {
  const row = {
    deliveryId: 'del_1',
    transactionId: 'txn_1',
    customerId: 'cus_1',
    address: 'Calle 1',
    city: 'Bogotá',
    region: 'Cundinamarca',
    feeMinor: 5000,
    status: 'PENDING' as const,
  };

  it('getById and put succeed', async () => {
    const entities = {
      deliveries: {
        get: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
      },
    };
    const repo = new ElectroDbDeliveryRepository(entities as never);
    expect((await repo.getById('del_1'))._unsafeUnwrap().id).toBe('del_1');
    expect(
      (
        await repo.put({
          id: 'del_1',
          transactionId: 'txn_1',
          customerId: 'cus_1',
          address: 'Calle 1',
          city: 'Bogotá',
          region: 'Cundinamarca',
          feeMinor: 5000,
          status: 'PENDING',
        })
      ).isOk(),
    ).toBe(true);
  });

  it('maps missing and persistence errors', async () => {
    const entities = {
      deliveries: {
        get: jest
          .fn()
          .mockReturnValueOnce({
            go: jest.fn().mockResolvedValue({ data: null }),
          })
          .mockReturnValueOnce({
            go: jest.fn().mockRejectedValue(new Error('x')),
          }),
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockRejectedValue('bad'),
        }),
      },
    };
    const repo = new ElectroDbDeliveryRepository(entities as never);
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('NOT_FOUND');
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');
    expect(
      (
        await repo.put({
          id: 'del_1',
          transactionId: 'txn_1',
          customerId: 'cus_1',
          address: 'Calle 1',
          city: 'Bogotá',
          region: 'Cundinamarca',
          feeMinor: 5000,
          status: 'PENDING',
        })
      )._unsafeUnwrapErr().type,
    ).toBe('PERSISTENCE_ERROR');
  });
});
