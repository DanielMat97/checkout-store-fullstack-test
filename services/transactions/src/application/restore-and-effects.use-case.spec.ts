import { ApplyPaymentApprovedEffectsUseCase } from './apply-payment-approved-effects.use-case';
import { RestoreTransactionStockUseCase } from './restore-transaction-stock.use-case';
import {
  InMemoryDeliveryWriter,
  InMemoryProductReader,
  InMemoryTransactionRepository,
} from './test-fakes';

const product = {
  id: 'prod_1',
  name: 'Aura',
  kicker: 'k',
  description: 'd',
  priceMinor: 1000,
  stock: 3,
  imageUrl: 'https://example.com/a.jpg',
  imageAlt: 'a',
};

describe('ApplyPaymentApprovedEffectsUseCase', () => {
  const products = new InMemoryProductReader();
  const deliveries = new InMemoryDeliveryWriter();
  const transactions = new InMemoryTransactionRepository();

  beforeEach(async () => {
    products.seed([{ ...product }]);
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

  const event = {
    type: 'PaymentApproved' as const,
    transactionId: 'tx_1',
    deliveryId: 'del_1',
    productId: 'prod_1',
    qty: 1,
  };

  it('decrements stock and marks delivery FULFILLABLE once', async () => {
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const first = await useCase.execute(event);
    expect(first.isOk()).toBe(true);
    expect(products.decrementCalls).toHaveLength(1);
    const second = await useCase.execute(event);
    expect(second.isOk()).toBe(true);
    expect(products.decrementCalls).toHaveLength(1);
    expect((await products.getById('prod_1'))._unsafeUnwrap().stock).toBe(2);
  });

  it('rejects when transaction missing', async () => {
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute({ ...event, transactionId: 'missing' });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('NOT_FOUND');
  });

  it('rejects when status is not APPROVED', async () => {
    await transactions.update({
      ...(await transactions.getById('tx_1'))._unsafeUnwrap(),
      status: 'PENDING',
    });
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute(event);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('INVALID_STATE');
  });

  it('rejects on insufficient stock', async () => {
    products.seed([{ ...product, stock: 0 }]);
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute(event);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('INSUFFICIENT_STOCK');
  });

  it('rejects when delivery missing', async () => {
    const useCase = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute({ ...event, deliveryId: 'missing' });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('NOT_FOUND');
  });
});

describe('RestoreTransactionStockUseCase', () => {
  async function seedApproved() {
    const products = new InMemoryProductReader();
    const deliveries = new InMemoryDeliveryWriter();
    const transactions = new InMemoryTransactionRepository();
    products.seed([{ ...product, stock: 2 }]);
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
    return { products, deliveries, transactions };
  }

  it('increments stock, cancels delivery, marks REFUNDED', async () => {
    const { products, deliveries, transactions } = await seedApproved();
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
  });

  it('validates empty id', async () => {
    const { products, deliveries, transactions } = await seedApproved();
    const useCase = new RestoreTransactionStockUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute('');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('VALIDATION');
  });

  it('rejects non-APPROVED', async () => {
    const { products, deliveries, transactions } = await seedApproved();
    await transactions.update({
      ...(await transactions.getById('tx_1'))._unsafeUnwrap(),
      status: 'PENDING',
    });
    const useCase = new RestoreTransactionStockUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute('tx_1');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('INVALID_STATE');
  });

  it('rejects already restored', async () => {
    const { products, deliveries, transactions } = await seedApproved();
    await transactions.update({
      ...(await transactions.getById('tx_1'))._unsafeUnwrap(),
      stockRestoredAt: '2026-01-02T00:00:00.000Z',
    });
    const useCase = new RestoreTransactionStockUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute('tx_1');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('INVALID_STATE');
  });

  it('rejects missing transaction', async () => {
    const { products, deliveries, transactions } = await seedApproved();
    const useCase = new RestoreTransactionStockUseCase(
      transactions,
      products,
      deliveries,
    );
    const result = await useCase.execute('nope');
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe('NOT_FOUND');
  });
});
