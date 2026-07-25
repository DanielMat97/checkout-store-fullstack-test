import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type {
  TransactionRepositoryPort,
  TransactionStatus,
} from '@app/persistence';
import type { Transaction } from '../domain/transaction';
import type { DomainError } from '../domain/errors';
import { TRANSACTION_REPOSITORY } from '../ports/injection.tokens';

export type ListTransactionsInput = {
  status?: TransactionStatus;
  limit?: number;
};

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
  ) {}

  async execute(
    input: ListTransactionsInput = {},
  ): Promise<Result<{ items: Transaction[] }, DomainError>> {
    const limit =
      input.limit !== undefined && Number.isFinite(input.limit) ? input.limit : 50;
    const result = await this.transactions.listByCreatedAt({
      status: input.status,
      limit,
    });
    if (result.isErr()) {
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          result.error.type === 'PERSISTENCE_ERROR'
            ? result.error.message
            : result.error.type,
      });
    }
    return ok({ items: result.value });
  }
}
