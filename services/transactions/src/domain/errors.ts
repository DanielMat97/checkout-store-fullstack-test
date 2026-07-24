import type { TransactionStatus } from '@app/persistence';
import type { Transaction } from './transaction';

export type DomainError =
  | { type: 'NOT_FOUND'; entity: string; id: string }
  | { type: 'INSUFFICIENT_STOCK'; productId: string; stock: number }
  | { type: 'INVALID_STATE'; message: string }
  | { type: 'VALIDATION'; message: string }
  | { type: 'PAYMENT_FAILED'; message: string }
  | { type: 'PERSISTENCE_ERROR'; message: string };

export type MoneyInput = {
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
};

export function totalOf(money: MoneyInput): number {
  return money.productAmount + money.baseFee + money.deliveryFee;
}

export function assertPending(tx: Transaction): DomainError | null {
  if (tx.status !== 'PENDING') {
    return {
      type: 'INVALID_STATE',
      message: `Transaction ${tx.id} is ${tx.status}, expected PENDING`,
    };
  }
  return null;
}

export type { TransactionStatus };
