import { MOCK_FEES, MOCK_PRODUCT, type MockProduct } from './catalog';

export function isMockMode(): boolean {
  return import.meta.env.VITE_MOCK_MODE !== 'false';
}

let stockOverride: number | null = null;

export function getMockProduct(): MockProduct {
  return {
    ...MOCK_PRODUCT,
    stock: stockOverride ?? MOCK_PRODUCT.stock,
  };
}

export function getMockFees() {
  return MOCK_FEES;
}

export function resetMockStock(): void {
  stockOverride = null;
}

export async function mockPay(input: {
  simulateDecline: boolean;
}): Promise<{
  transactionId: string;
  status: 'APPROVED' | 'DECLINED';
  stock: number;
}> {
  await new Promise((r) => setTimeout(r, 700));
  const transactionId = `txn_mock_${Date.now().toString(36)}`;
  if (input.simulateDecline) {
    return {
      transactionId,
      status: 'DECLINED',
      stock: stockOverride ?? MOCK_PRODUCT.stock,
    };
  }
  const current = stockOverride ?? MOCK_PRODUCT.stock;
  stockOverride = Math.max(0, current - 1);
  return {
    transactionId,
    status: 'APPROVED',
    stock: stockOverride,
  };
}
