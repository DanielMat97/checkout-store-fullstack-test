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
    expect(result.isErr() && result.error).toEqual({
      type: 'PERSISTENCE_ERROR',
      message: 'down',
    });
  });

  it('uses error type as message when repo error is not PERSISTENCE_ERROR', async () => {
    const uc = new ListTransactionsUseCase({
      listByCreatedAt: jest
        .fn()
        .mockResolvedValue(err({ type: 'NOT_FOUND', entity: 'transaction', id: 'x' })),
    } as never);
    const result = await uc.execute();
    expect(result.isErr() && result.error).toEqual({
      type: 'PERSISTENCE_ERROR',
      message: 'NOT_FOUND',
    });
  });
});
