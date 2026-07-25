import { ApplyPaymentApprovedEffectsUseCase } from './apply-payment-approved-effects.use-case';
import { RestoreTransactionStockUseCase } from './restore-transaction-stock.use-case';
import {
  InMemoryDeliveryWriter,
  InMemoryProductReader,
  InMemoryTransactionRepository,
} from './test-fakes';

describe('ApplyPaymentApprovedEffectsUseCase', () => {
  const products = new InMemoryProductReader();
  const deliveries = new InMemoryDeliveryWriter();
  const transactions = new InMemoryTransactionRepository();

  beforeEach(async () => {
    products.seed([
      {
        id: 'prod_1',
        name: 'Aura',
        kicker: 'k',
        description: 'd',
        priceMinor: 1000,
        stock: 3,
        imageUrl: 'https://example.com/a.jpg',
        imageAlt: 'a',
      },
    ]);
    products.decrementCalls = [];
    await deliveries.put({
      id: 'del_1',
      transactionId: 'tx_1',
      customerId: 'cus_1',
      address: 'a',
      city: 'c',
      region: 'r',
      feeMinor: 5000,
      status: 'PENDING',
    });
    await transactions.put({
      id: 'tx_1',
      status: 'APPROVED',
      productId: 'prod_1',
      customerId: 'cus_1',
      productAmount: 1000,
      baseFee: 1500,
      deliveryFee: 5000,
      total: 7500,
      createdAt: '2026-01-01T00:00:00.000Z',
      deliveryId: 'del_1',
      effectsApplied: false,
    });
  });

  it('decrements stock and marks delivery FULFILLABLE once', async () => {
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const event = {
      type: 'PaymentApproved' as const,
      transactionId: 'tx_1',
      deliveryId: 'del_1',
      productId: 'prod_1',
      qty: 1,
    };
    const first = await useCase.execute(event);
    expect(first.isOk()).toBe(true);
    expect(products.decrementCalls).toHaveLength(1);
    const second = await useCase.execute(event);
    expect(second.isOk()).toBe(true);
    expect(products.decrementCalls).toHaveLength(1);
    expect((await products.getById('prod_1'))._unsafeUnwrap().stock).toBe(2);
  });
});

describe('RestoreTransactionStockUseCase', () => {
  it('increments stock, cancels delivery, marks REFUNDED', async () => {
    const products = new InMemoryProductReader();
    const deliveries = new InMemoryDeliveryWriter();
    const transactions = new InMemoryTransactionRepository();
    products.seed([
      {
        id: 'prod_1',
        name: 'Aura',
        kicker: 'k',
        description: 'd',
        priceMinor: 1000,
        stock: 2,
        imageUrl: 'https://example.com/a.jpg',
        imageAlt: 'a',
      },
    ]);
    await deliveries.put({
      id: 'del_1',
      transactionId: 'tx_1',
      customerId: 'cus_1',
      address: 'a',
      city: 'c',
      region: 'r',
      feeMinor: 5000,
      status: 'FULFILLABLE',
    });
    await transactions.put({
      id: 'tx_1',
      status: 'APPROVED',
      productId: 'prod_1',
      customerId: 'cus_1',
      productAmount: 1000,
      baseFee: 1500,
      deliveryFee: 5000,
      total: 7500,
      createdAt: '2026-01-01T00:00:00.000Z',
      deliveryId: 'del_1',
      effectsApplied: true,
    });

    const useCase = new RestoreTransactionStockUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute('tx_1');
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.stock).toBe(3);
      expect(result.value.transactionStatus).toBe('REFUNDED');
      expect(result.value.deliveryStatus).toBe('CANCELLED');
    }
    expect((await deliveries.getById('del_1'))._unsafeUnwrap().status).toBe('CANCELLED');
  });
});
