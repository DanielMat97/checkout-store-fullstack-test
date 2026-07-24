import { ElectroDbTransactionRepository } from './electrodb-transaction.repository';

describe('ElectroDbTransactionRepository', () => {
  const row = {
    transactionId: 'txn_1',
    status: 'PENDING' as const,
    productId: 'prod_a',
    customerId: 'cus_1',
    productAmount: 1000,
    baseFee: 1500,
    deliveryFee: 5000,
    total: 7500,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('getById / put / update succeed', async () => {
    const entities = {
      transactions: {
        get: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
        put: jest.fn().mockReturnValue({
          go: jest.fn().mockResolvedValue({ data: row }),
        }),
      },
    };
    const repo = new ElectroDbTransactionRepository(entities as never);
    const got = await repo.getById('txn_1');
    expect(got._unsafeUnwrap().id).toBe('txn_1');

    const record = {
      id: 'txn_1',
      status: 'PENDING' as const,
      productId: 'prod_a',
      customerId: 'cus_1',
      productAmount: 1000,
      baseFee: 1500,
      deliveryFee: 5000,
      total: 7500,
      createdAt: row.createdAt,
    };
    expect((await repo.put(record)).isOk()).toBe(true);
    expect((await repo.update({ ...record, status: 'APPROVED' })).isOk()).toBe(true);
  });

  it('maps missing and persistence errors', async () => {
    const entities = {
      transactions: {
        get: jest
          .fn()
          .mockReturnValueOnce({
            go: jest.fn().mockResolvedValue({ data: null }),
          })
          .mockReturnValueOnce({
            go: jest.fn().mockRejectedValue(new Error('x')),
          })
          .mockReturnValueOnce({
            go: jest.fn().mockResolvedValue({ data: null }),
          })
          .mockReturnValue({
            go: jest.fn().mockRejectedValue(new Error('update')),
          }),
        put: jest
          .fn()
          .mockReturnValueOnce({
            go: jest.fn().mockRejectedValue('put-bad'),
          })
          .mockReturnValue({
            go: jest.fn().mockRejectedValue(new Error('update-put')),
          }),
      },
    };
    const repo = new ElectroDbTransactionRepository(entities as never);
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('NOT_FOUND');
    expect((await repo.getById('x'))._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');

    const record = {
      id: 'txn_1',
      status: 'PENDING' as const,
      productId: 'prod_a',
      customerId: 'cus_1',
      productAmount: 1000,
      baseFee: 1500,
      deliveryFee: 5000,
      total: 7500,
      createdAt: row.createdAt,
    };
    expect((await repo.put(record))._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');
    expect((await repo.update(record))._unsafeUnwrapErr().type).toBe('NOT_FOUND');

    // get ok then put throws
    entities.transactions.get.mockReturnValue({
      go: jest.fn().mockResolvedValue({ data: row }),
    });
    expect((await repo.update(record))._unsafeUnwrapErr().type).toBe('PERSISTENCE_ERROR');
  });
});
