import { FakePaymentGateway } from '../adapters/outbound/payment/fake-payment.gateway';
import { InProcessOrderEventsPublisher } from '../adapters/outbound/order-events/in-process-order-events.publisher';
import { ApplyPaymentApprovedEffectsUseCase } from './apply-payment-approved-effects.use-case';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { PayTransactionUseCase } from './pay-transaction.use-case';
import {
  InMemoryCustomerReader,
  InMemoryDeliveryWriter,
  InMemoryProductReader,
  InMemoryTransactionRepository,
} from './test-fakes';

describe('PayTransactionUseCase', () => {
  const products = new InMemoryProductReader();
  const customers = new InMemoryCustomerReader();
  const deliveries = new InMemoryDeliveryWriter();
  const transactions = new InMemoryTransactionRepository();

  const card = {
    number: '4111111111111111',
    cvc: '123',
    expMonth: '12',
    expYear: '30',
    cardHolder: 'Ada Lovelace',
  };

  function payUseCase(gateway: FakePaymentGateway) {
    const applyEffects = new ApplyPaymentApprovedEffectsUseCase(
      transactions,
      products,
      deliveries,
    );
    const publisher = new InProcessOrderEventsPublisher(applyEffects);
    return new PayTransactionUseCase(transactions, customers, gateway, publisher);
  }

  async function seedPending() {
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
    products.decrementCalls = [];

    const create = new CreateTransactionUseCase(
      transactions,
      products,
      customers,
      deliveries,
    );
    const created = await create.execute({
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
    return created._unsafeUnwrap();
  }

  it('APPROVED: updates tx, marks delivery fulfillable, decrements stock', async () => {
    const pending = await seedPending();
    const pay = payUseCase(new FakePaymentGateway('APPROVED'));

    const result = await pay.execute({
      transactionId: pending.transaction.id,
      deliveryId: pending.deliveryId,
      card,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.paymentStatus).toBe('APPROVED');
      expect(result.value.transaction.status).toBe('APPROVED');
      expect(result.value.transaction.effectsApplied).toBe(true);
    }
    expect(products.decrementCalls).toEqual([{ id: 'prod_aura_quiet', qty: 1 }]);
    const stock = await products.getById('prod_aura_quiet');
    expect(stock._unsafeUnwrap().stock).toBe(4);
    const delivery = await deliveries.getById(pending.deliveryId);
    expect(delivery._unsafeUnwrap().status).toBe('FULFILLABLE');
  });

  it('DECLINED: updates tx without decrementing stock', async () => {
    const pending = await seedPending();
    const pay = payUseCase(new FakePaymentGateway('DECLINED'));

    const result = await pay.execute({
      transactionId: pending.transaction.id,
      deliveryId: pending.deliveryId,
      card,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.paymentStatus).toBe('DECLINED');
      expect(result.value.transaction.status).toBe('DECLINED');
    }
    expect(products.decrementCalls).toEqual([]);
    const stock = await products.getById('prod_aura_quiet');
    expect(stock._unsafeUnwrap().stock).toBe(5);
  });

  it('ERROR: updates tx without decrementing stock', async () => {
    const pending = await seedPending();
    const pay = payUseCase(new FakePaymentGateway('ERROR'));

    const result = await pay.execute({
      transactionId: pending.transaction.id,
      deliveryId: pending.deliveryId,
      card,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.paymentStatus).toBe('ERROR');
      expect(result.value.transaction.status).toBe('ERROR');
    }
    expect(products.decrementCalls).toEqual([]);
  });
});
