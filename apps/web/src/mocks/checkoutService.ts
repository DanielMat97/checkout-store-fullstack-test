import { readPublicEnv } from '../publicEnv';
import {
  getProductById,
  initialStockMap,
  MOCK_FEES,
  MOCK_PRODUCTS,
  type MockProduct,
} from './catalog';

export function isMockMode(): boolean {
  return readPublicEnv('VITE_MOCK_MODE', 'true') !== 'false';
}

let stockById: Record<string, number> = initialStockMap();

export function listMockProducts(): MockProduct[] {
  return MOCK_PRODUCTS.map((p) => ({
    ...p,
    stock: stockById[p.id] ?? p.stock,
  }));
}

export function getMockProduct(productId?: string | null): MockProduct {
  const base = (productId ? getProductById(productId) : undefined) ?? MOCK_PRODUCTS[0];
  return {
    ...base,
    stock: stockById[base.id] ?? base.stock,
  };
}

export function getMockFees() {
  return MOCK_FEES;
}

export function resetMockStock(): void {
  stockById = initialStockMap();
}

export async function mockPay(input: {
  productId: string;
  simulateDecline: boolean;
}): Promise<{
  transactionId: string;
  status: 'APPROVED' | 'DECLINED';
  stock: number;
  stocks: Record<string, number>;
}> {
  await new Promise((r) => setTimeout(r, 700));
  const transactionId = `txn_mock_${Date.now().toString(36)}`;
  const current = stockById[input.productId] ?? 0;

  if (input.simulateDecline) {
    return {
      transactionId,
      status: 'DECLINED',
      stock: current,
      stocks: { ...stockById },
    };
  }

  stockById = {
    ...stockById,
    [input.productId]: Math.max(0, current - 1),
  };

  return {
    transactionId,
    status: 'APPROVED',
    stock: stockById[input.productId],
    stocks: { ...stockById },
  };
}
