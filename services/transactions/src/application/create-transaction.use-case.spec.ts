import { CreateTransactionUseCase } from './create-transaction.use-case';
import {
  InMemoryCustomerReader,
  InMemoryDeliveryWriter,
  InMemoryProductReader,
  InMemoryTransactionRepository,
} from './test-fakes';

describe('CreateTransactionUseCase', () => {
  const products = new InMemoryProductReader();
  const customers = new InMemoryCustomerReader();
  const deliveries = new InMemoryDeliveryWriter();
  const transactions = new InMemoryTransactionRepository();
  const useCase = new CreateTransactionUseCase(
    transactions,
    products,
    customers,
    deliveries,
  );

  beforeEach(() => {
    products.seed([
      {
        id: 'prod_aura_quiet',
        name: 'Aura Quiet',
        kicker: 'Listening',
        description: 'desc',
        priceMinor: 1000,
        stock: 5,
        imageUrl: 'https://example.com/a.jpg',
        imageAlt: 'alt',
      },
    ]);
    customers.seed([
      {
        id: 'cust_1',
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+573001112233',
      },
    ]);
  });

  it('creates PENDING transaction and delivery', async () => {
    const result = await useCase.execute({
      productId: 'prod_aura_quiet',
      customerId: 'cust_1',
      productAmount: 1000,
      baseFee: 1500,
      deliveryFee: 5000,
      delivery: {
        address: 'Calle 1 #2-3',
        city: 'Bogotá',
        region: 'Cundinamarca',
      },
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.transaction.status).toBe('PENDING');
      expect(result.value.transaction.total).toBe(7500);
      expect(result.value.deliveryId).toMatch(/^del_/);
    }
  });

  it('fails with typed NOT_FOUND when product missing', async () => {
    const result = await useCase.execute({
      productId: 'missing',
      customerId: 'cust_1',
      productAmount: 1000,
      baseFee: 0,
      deliveryFee: 0,
      delivery: { address: 'a', city: 'b', region: 'c' },
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('NOT_FOUND');
    }
  });

  it('fails with INSUFFICIENT_STOCK when stock is 0', async () => {
    products.seed([
      {
        id: 'prod_aura_quiet',
        name: 'Aura Quiet',
        kicker: 'Listening',
        description: 'desc',
        priceMinor: 1000,
        stock: 0,
        imageUrl: 'https://example.com/a.jpg',
        imageAlt: 'alt',
      },
    ]);
    const result = await useCase.execute({
      productId: 'prod_aura_quiet',
      customerId: 'cust_1',
      productAmount: 1000,
      baseFee: 0,
      deliveryFee: 0,
      delivery: { address: 'a', city: 'b', region: 'c' },
    });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe('INSUFFICIENT_STOCK');
    }
  });

  it('validates payload and missing customer', async () => {
    expect(
      (
        await useCase.execute({
          productId: '',
          customerId: '',
          productAmount: 0,
          baseFee: -1,
          deliveryFee: -1,
          delivery: { address: 'a', city: 'b', region: 'c' },
        })
      )._unsafeUnwrapErr().type,
    ).toBe('VALIDATION');
    expect(
      (
        await useCase.execute({
          productId: 'prod_aura_quiet',
          customerId: 'cust_1',
          productAmount: 1000,
          baseFee: 0,
          deliveryFee: 0,
          delivery: { address: '', city: '', region: '' },
        })
      )._unsafeUnwrapErr().type,
    ).toBe('VALIDATION');
    expect(
      (
        await useCase.execute({
          productId: 'prod_aura_quiet',
          customerId: 'missing',
          productAmount: 1000,
          baseFee: 0,
          deliveryFee: 0,
          delivery: { address: 'a', city: 'b', region: 'c' },
        })
      )._unsafeUnwrapErr().type,
    ).toBe('NOT_FOUND');
  });
});
