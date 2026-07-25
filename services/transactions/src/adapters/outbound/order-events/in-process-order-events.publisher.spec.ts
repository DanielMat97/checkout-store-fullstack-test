import { err, ok } from 'neverthrow';
import { InProcessOrderEventsPublisher } from './in-process-order-events.publisher';

describe('InProcessOrderEventsPublisher', () => {
  const event = {
    type: 'PaymentApproved' as const,
    transactionId: 'tx_1',
    deliveryId: 'del_1',
    productId: 'prod_1',
    qty: 1,
  };

  it('applies effects successfully', async () => {
    const applyEffects = {
      execute: jest.fn().mockResolvedValue(
        ok({
          transaction: { id: 'tx_1' },
          delivery: { id: 'del_1' },
          product: { id: 'prod_1' },
        }),
      ),
    };
    const publisher = new InProcessOrderEventsPublisher(applyEffects as never);
    await expect(publisher.publishPaymentApproved(event)).resolves.toBeUndefined();
  });

  it('throws when effects fail with message', async () => {
    const applyEffects = {
      execute: jest
        .fn()
        .mockResolvedValue(err({ type: 'INVALID_STATE', message: 'nope' })),
    };
    const publisher = new InProcessOrderEventsPublisher(applyEffects as never);
    await expect(publisher.publishPaymentApproved(event)).rejects.toThrow(/nope/);
  });

  it('throws using error type when message missing', async () => {
    const applyEffects = {
      execute: jest.fn().mockResolvedValue(err({ type: 'NOT_FOUND', entity: 'x', id: '1' })),
    };
    const publisher = new InProcessOrderEventsPublisher(applyEffects as never);
    await expect(publisher.publishPaymentApproved(event)).rejects.toThrow(/NOT_FOUND/);
  });
});
