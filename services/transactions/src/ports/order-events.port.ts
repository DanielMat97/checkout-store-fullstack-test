import type {
  DeliveryRecord,
  ProductRecord,
  TransactionRecord,
} from '@app/persistence';

/** Event published after tx is persisted as APPROVED. */
export type PaymentApprovedEvent = {
  type: 'PaymentApproved';
  transactionId: string;
  deliveryId: string;
  productId: string;
  qty: number;
};

export type OrderEventsPublisher = {
  publishPaymentApproved(
    event: PaymentApprovedEvent,
  ): Promise<void>;
};

export type PaymentApprovedEffects = {
  transaction: TransactionRecord;
  delivery: DeliveryRecord;
  product: ProductRecord;
};
