import { ListTransactionsUseCase } from './list-transactions.use-case';
import { ok, err } from 'neverthrow';

describe('ListTransactionsUseCase', () => {
  it('lists items', async () => {
    const uc = new ListTransactionsUseCase({
      listByCreatedAt: jest.fn().mockResolvedValue(ok([{ id: 'txn_1' }])),
    } as never);
    const result = await uc.execute({ status: 'APPROVED', limit: 10 });
    expect(result.isOk() && result.value.items).toEqual([{ id: 'txn_1' }]);
  });

  it('maps persistence errors', async () => {
    const uc = new ListTransactionsUseCase({
      listByCreatedAt: jest
        .fn()
        .mockResolvedValue(err({ type: 'PERSISTENCE_ERROR', message: 'down' })),
    } as never);
    const result = await uc.execute();
    expect(result.isErr() && result.error.type).toBe('PERSISTENCE_ERROR');
  });
});
