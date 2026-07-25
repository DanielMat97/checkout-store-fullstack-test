import {
  fetchDelivery,
  listTransactions,
  markDeliveryFulfilled,
  restoreTransaction,
} from '../../api/checkout';
import { fetchProduct } from '../../api/products';
import type { Delivery, Transaction } from '../../api/types';
import { isMockMode } from '../../mocks/checkoutService';

export type OrderRow = {
  transaction: Transaction;
  productName: string;
  productStock: number | null;
  delivery: Delivery | null;
};

export async function loadApprovedOrders(): Promise<OrderRow[]> {
  if (isMockMode()) {
    return [];
  }
  const txs = await listTransactions({ status: 'APPROVED', limit: 50 });
  const rows: OrderRow[] = [];
  for (const transaction of txs) {
    let productName = transaction.productId;
    let productStock: number | null = null;
    try {
      const product = await fetchProduct(transaction.productId);
      productName = product.name;
      productStock = product.stock;
    } catch {
      // keep id fallback
    }
    let delivery: Delivery | null = null;
    if (transaction.deliveryId) {
      try {
        delivery = await fetchDelivery(transaction.deliveryId);
      } catch {
        delivery = null;
      }
    }
    rows.push({ transaction, productName, productStock, delivery });
  }
  return rows;
}

export async function restoreOrderStock(transactionId: string) {
  return restoreTransaction(transactionId);
}

export async function fulfillOrderDelivery(deliveryId: string) {
  return markDeliveryFulfilled(deliveryId);
}
