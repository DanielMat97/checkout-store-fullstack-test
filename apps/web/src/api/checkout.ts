import { apiFetch } from './http';
import type {
  CreateTransactionResponse,
  Customer,
  PayTransactionResponse,
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
