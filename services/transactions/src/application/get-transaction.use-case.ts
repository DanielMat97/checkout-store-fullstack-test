import { Injectable, Inject } from '@nestjs/common';
import { err, ok, type Result } from 'neverthrow';
import type { TransactionRepositoryPort } from '@app/persistence';
import type { Transaction } from '../domain/transaction';
import type { DomainError } from '../domain/errors';
import { TRANSACTION_REPOSITORY } from '../ports/injection.tokens';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction, DomainError>> {
    if (!id) {
      return err({ type: 'VALIDATION', message: 'transaction id required' });
    }
    const loaded = await this.transactions.getById(id);
    if (loaded.isErr()) {
      if (loaded.error.type === 'NOT_FOUND') {
        return err({ type: 'NOT_FOUND', entity: 'transaction', id });
      }
      return err({
        type: 'PERSISTENCE_ERROR',
        message:
          loaded.error.type === 'PERSISTENCE_ERROR'
            ? loaded.error.message
            : loaded.error.type,
      });
    }
    return ok(loaded.value);
  }
}
