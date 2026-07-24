export interface Product {
  id: string;
  name: string;
  kicker: string;
  description: string;
  priceMinor: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  productId: string;
  customerId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  providerRef?: string;
  createdAt: string;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  deliveryId: string;
}

export interface PayTransactionResponse {
  paymentStatus: 'APPROVED' | 'DECLINED' | 'ERROR';
  transaction: Transaction;
}

export interface ApiErrorBody {
  error?: string | { type?: string; message?: string };
  message?: string;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
