import { apiFetch } from './http';
import type {
  CreateTransactionResponse,
  Customer,
  Delivery,
  PayTransactionResponse,
  RestoreTransactionResponse,
  Transaction,
} from './types';

export async function createCustomer(input: {
  fullName: string;
  email: string;
  phone: string;
}): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createTransaction(input: {
  productId: string;
  customerId: string;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  delivery: { address: string; city: string; region: string };
}): Promise<CreateTransactionResponse> {
  return apiFetch<CreateTransactionResponse>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function payTransaction(
  transactionId: string,
  input: {
    deliveryId: string;
    card: {
      number: string;
      cvc: string;
      expMonth: string;
      expYear: string;
      cardHolder: string;
    };
  },
): Promise<PayTransactionResponse> {
  return apiFetch<PayTransactionResponse>(
    `/transactions/${encodeURIComponent(transactionId)}/pay`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export async function listTransactions(options?: {
  status?: Transaction['status'];
  limit?: number;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  const data = await apiFetch<{ items: Transaction[] }>(
    `/transactions${qs ? `?${qs}` : ''}`,
  );
  return data.items;
}

export async function restoreTransaction(
  transactionId: string,
): Promise<RestoreTransactionResponse> {
  return apiFetch<RestoreTransactionResponse>(
    `/transactions/${encodeURIComponent(transactionId)}/restore`,
    { method: 'POST' },
  );
}

export async function fetchDelivery(deliveryId: string): Promise<Delivery> {
  return apiFetch<Delivery>(`/deliveries/${encodeURIComponent(deliveryId)}`);
}

export async function markDeliveryFulfilled(deliveryId: string): Promise<Delivery> {
  return apiFetch<Delivery>(`/deliveries/${encodeURIComponent(deliveryId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'FULFILLED' }),
  });
}
