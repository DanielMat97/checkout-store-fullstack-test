import { fetchProduct, fetchProducts, fetchProductStock } from '../../api/products';
import type { Product } from '../../api/types';
import { createCustomer, createTransaction, payTransaction } from '../../api/checkout';
import { getProductById } from '../../mocks/catalog';
import {
  getMockFees,
  getMockProduct,
  isMockMode,
  listMockProducts,
  mockPay,
} from '../../mocks/checkoutService';
import { readPublicEnv } from '../../publicEnv';
import type { DeliveryInfo } from '../../store/checkoutSlice';
import type { PendingCard } from './cardSession';

export type { Product };

export function getFees() {
  if (isMockMode()) {
    return getMockFees();
  }
  return {
    baseFee: Number(readPublicEnv('VITE_BASE_FEE', '1500')),
    deliveryFee: Number(readPublicEnv('VITE_DELIVERY_FEE', '5000')),
  };
}

export async function listCatalogProducts(): Promise<Product[]> {
  if (isMockMode()) {
    return listMockProducts();
  }
  return fetchProducts();
}

export async function loadProduct(productId: string): Promise<Product | null> {
  if (isMockMode()) {
    const found = getProductById(productId);
    return found ? getMockProduct(productId) : null;
  }
  try {
    return await fetchProduct(productId);
  } catch {
    return null;
  }
}

export async function refreshProductStock(productId: string): Promise<number> {
  if (isMockMode()) {
    return getMockProduct(productId).stock;
  }
  const data = await fetchProductStock(productId);
  return data.stock;
}

export type LivePayInput = {
  product: Product;
  delivery: DeliveryInfo;
  card: PendingCard;
  simulateDecline?: boolean;
};

export type PayResult = {
  transactionId: string;
  status: 'APPROVED' | 'DECLINED' | 'ERROR';
  stock: number;
  stocks?: Record<string, number>;
};

export async function executePay(input: LivePayInput): Promise<PayResult> {
  if (isMockMode()) {
    const result = await mockPay({
      productId: input.product.id,
      simulateDecline: Boolean(input.simulateDecline),
    });
    return {
      transactionId: result.transactionId,
      status: result.status,
      stock: result.stock,
      stocks: result.stocks,
    };
  }

  const fees = getFees();
  const customer = await createCustomer({
    fullName: input.delivery.fullName,
    email: input.delivery.email,
    phone: input.delivery.phone,
  });

  const created = await createTransaction({
    productId: input.product.id,
    customerId: customer.id,
    productAmount: input.product.priceMinor,
    baseFee: fees.baseFee,
    deliveryFee: fees.deliveryFee,
    delivery: {
      address: input.delivery.address,
      city: input.delivery.city,
      region: input.delivery.region,
    },
  });

  const paid = await payTransaction(created.transaction.id, {
    deliveryId: created.deliveryId,
    card: {
      number: input.card.number.replace(/\s+/g, ''),
      cvc: input.card.cvc,
      expMonth: input.card.expMonth,
      expYear: input.card.expYear,
      cardHolder: input.card.cardHolder,
    },
  });

  let stock = input.product.stock;
  if (paid.paymentStatus === 'APPROVED') {
    try {
      stock = await refreshProductStock(input.product.id);
    } catch {
      stock = Math.max(0, input.product.stock - 1);
    }
  }

  return {
    transactionId: paid.transaction.id,
    status: paid.paymentStatus,
    stock,
  };
}
