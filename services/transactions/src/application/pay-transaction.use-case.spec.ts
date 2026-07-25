import { err } from 'neverthrow';
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

  it('validates ids and card fields', async () => {
    const pay = payUseCase(new FakePaymentGateway('APPROVED'));
    expect(
      (
        await pay.execute({
          transactionId: '',
          deliveryId: '',
          card,
        })
      )._unsafeUnwrapErr().type,
    ).toBe('VALIDATION');
    expect(
      (
        await pay.execute({
          transactionId: 'tx_1',
          deliveryId: 'del_1',
          card: { ...card, number: '' },
        })
      )._unsafeUnwrapErr().type,
    ).toBe('VALIDATION');
  });

  it('rejects non-PENDING and missing customer', async () => {
    const pending = await seedPending();
    await transactions.update({
      ...pending.transaction,
      status: 'APPROVED',
    });
    const pay = payUseCase(new FakePaymentGateway('APPROVED'));
    expect(
      (
        await pay.execute({
          transactionId: pending.transaction.id,
          deliveryId: pending.deliveryId,
          card,
        })
      )._unsafeUnwrapErr().type,
    ).toBe('INVALID_STATE');

    const fresh = await seedPending();
    customers.seed([]);
    expect(
      (
        await pay.execute({
          transactionId: fresh.transaction.id,
          deliveryId: fresh.deliveryId,
          card,
        })
      )._unsafeUnwrapErr().type,
    ).toBe('NOT_FOUND');
  });

  it('propagates gateway Result errors (charge.isErr)', async () => {
    const pending = await seedPending();
    const gateway = {
      charge: jest
        .fn()
        .mockResolvedValue(err({ type: 'PAYMENT_FAILED', message: 'provider down' })),
    };
    const pay = new PayTransactionUseCase(
      transactions,
      customers,
      gateway as never,
      new InProcessOrderEventsPublisher(
        new ApplyPaymentApprovedEffectsUseCase(transactions, products, deliveries),
      ),
    );
    const result = await pay.execute({
      transactionId: pending.transaction.id,
      deliveryId: pending.deliveryId,
      card,
    });
    expect(result.isErr() && result.error).toEqual({
      type: 'PAYMENT_FAILED',
      message: 'provider down',
    });
  });

  it('falls back to saved tx when reload after publish fails', async () => {
    const pending = await seedPending();
    const publisher = {
      publishPaymentApproved: jest.fn().mockResolvedValue(undefined),
    };
    const pay = new PayTransactionUseCase(
      transactions,
      customers,
      new FakePaymentGateway('APPROVED'),
      publisher,
    );
    const originalGet = transactions.getById.bind(transactions);
    let getCalls = 0;
    jest.spyOn(transactions, 'getById').mockImplementation(async (id) => {
      getCalls += 1;
      if (getCalls === 1) return originalGet(id);
      return err({ type: 'PERSISTENCE_ERROR', message: 'reload failed' });
    });

    const result = await pay.execute({
      transactionId: pending.transaction.id,
      deliveryId: pending.deliveryId,
      card,
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.paymentStatus).toBe('APPROVED');
      expect(result.value.transaction.id).toBe(pending.transaction.id);
    }
    expect(publisher.publishPaymentApproved).toHaveBeenCalled();
  });
});
