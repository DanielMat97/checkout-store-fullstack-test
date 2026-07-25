export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'ERROR'
  | 'REFUNDED';
export type DeliveryStatus = 'PENDING' | 'FULFILLABLE' | 'FULFILLED' | 'CANCELLED';

export interface ProductRecord {
  id: string;
  name: string;
  kicker: string;
  description: string;
  priceMinor: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryRecord {
  id: string;
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  feeMinor: number;
  status: DeliveryStatus;
}

export interface TransactionRecord {
  id: string;
  status: TransactionStatus;
  productId: string;
  customerId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  providerRef?: string;
  createdAt: string;
  /** Delivery created with the PENDING tx (for worker / restore). */
  deliveryId?: string;
  /** True after stock decrement + delivery FULFILLABLE applied. */
  effectsApplied?: boolean;
  /** ISO timestamp when stock was restored via ops console. */
  stockRestoredAt?: string;
}

export type PersistenceError =
  | { type: 'NOT_FOUND'; entity: string; id: string }
  | { type: 'INSUFFICIENT_STOCK'; productId: string; stock: number; requested: number }
  | { type: 'PERSISTENCE_ERROR'; message: string };
