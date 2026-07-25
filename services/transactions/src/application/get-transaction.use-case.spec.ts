import { GetTransactionUseCase } from './get-transaction.use-case';
import { ok, err } from 'neverthrow';

describe('GetTransactionUseCase', () => {
  const tx = {
    id: 'txn_1',
    status: 'PENDING' as const,
    productId: 'prod_a',
    customerId: 'cus_1',
    productAmount: 1000,
    baseFee: 1500,
    deliveryFee: 5000,
    total: 7500,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('returns transaction', async () => {
    const uc = new GetTransactionUseCase({
      getById: jest.fn().mockResolvedValue(ok(tx)),
    } as never);
    await expect(uc.execute('txn_1')).resolves.toEqual(ok(tx));
  });

  it('maps not found and validation', async () => {
    const uc = new GetTransactionUseCase({
      getById: jest
        .fn()
        .mockResolvedValue(err({ type: 'NOT_FOUND', entity: 'transaction', id: 'x' })),
    } as never);
    await expect(uc.execute('')).resolves.toMatchObject({
      isErr: expect.any(Function),
    });
    const empty = await uc.execute('');
    expect(empty.isErr() && empty.error.type).toBe('VALIDATION');
    const missing = await uc.execute('x');
    expect(missing.isErr() && missing.error.type).toBe('NOT_FOUND');
  });

  it('maps persistence failures', async () => {
    const uc = new GetTransactionUseCase({
      getById: jest
        .fn()
        .mockResolvedValueOnce(err({ type: 'PERSISTENCE_ERROR', message: 'down' }))
        .mockResolvedValueOnce(err({ type: 'OTHER' as never })),
    } as never);
    const a = await uc.execute('a');
    expect(a.isErr() && a.error.type).toBe('PERSISTENCE_ERROR');
    if (a.isErr() && a.error.type === 'PERSISTENCE_ERROR') {
      expect(a.error.message).toBe('down');
    }
    const b = await uc.execute('b');
    expect(b.isErr() && b.error.type).toBe('PERSISTENCE_ERROR');
    if (b.isErr() && b.error.type === 'PERSISTENCE_ERROR') {
      expect(b.error.message).toBe('OTHER');
    }
  });
});
