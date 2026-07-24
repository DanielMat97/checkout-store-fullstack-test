export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
export type DeliveryStatus = 'PENDING' | 'FULFILLABLE' | 'FULFILLED';

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
}

export type PersistenceError =
  | { type: 'NOT_FOUND'; entity: string; id: string }
  | { type: 'INSUFFICIENT_STOCK'; productId: string; stock: number; requested: number }
  | { type: 'PERSISTENCE_ERROR'; message: string };
