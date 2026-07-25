import { err, ok } from 'neverthrow';
import {
  isPaymentApprovedEvent,
  processOrdersSqsEvent,
} from './orders-worker';

describe('orders-worker', () => {
  const event = {
    type: 'PaymentApproved' as const,
    transactionId: 'tx_1',
    deliveryId: 'del_1',
    productId: 'prod_1',
    qty: 1,
  };

  it('isPaymentApprovedEvent validates shape', () => {
    expect(isPaymentApprovedEvent(event)).toBe(true);
    expect(isPaymentApprovedEvent(null)).toBe(false);
    expect(isPaymentApprovedEvent({ type: 'Other' })).toBe(false);
    expect(isPaymentApprovedEvent({ ...event, qty: '1' })).toBe(false);
  });

  it('processOrdersSqsEvent applies effects', async () => {
    const applyEffects = {
      execute: jest.fn().mockResolvedValue(
        ok({
          transaction: { id: 'tx_1', effectsApplied: true },
          delivery: { id: 'del_1' },
          product: { id: 'prod_1', stock: 1 },
        }),
      ),
    };
    await processOrdersSqsEvent(
      {
        Records: [
          {
            messageId: 'm1',
            body: JSON.stringify(event),
            receiptHandle: '',
            attributes: {} as never,
            messageAttributes: {},
            md5OfBody: '',
            eventSource: 'aws:sqs',
            eventSourceARN: '',
            awsRegion: 'us-east-1',
          },
        ],
      },
      { applyEffects },
    );
    expect(applyEffects.execute).toHaveBeenCalledWith(event);
  });

  it('throws on invalid JSON', async () => {
    await expect(
      processOrdersSqsEvent(
        {
          Records: [
            {
              messageId: 'm2',
              body: '{bad',
              receiptHandle: '',
              attributes: {} as never,
              messageAttributes: {},
              md5OfBody: '',
              eventSource: 'aws:sqs',
              eventSourceARN: '',
              awsRegion: 'us-east-1',
            },
          ],
        },
        { applyEffects: { execute: jest.fn() } },
      ),
    ).rejects.toThrow(/Invalid JSON/);
  });

  it('throws on invalid event payload', async () => {
    await expect(
      processOrdersSqsEvent(
        {
          Records: [
            {
              messageId: 'm3',
              body: JSON.stringify({ type: 'Nope' }),
              receiptHandle: '',
              attributes: {} as never,
              messageAttributes: {},
              md5OfBody: '',
              eventSource: 'aws:sqs',
              eventSourceARN: '',
              awsRegion: 'us-east-1',
            },
          ],
        },
        { applyEffects: { execute: jest.fn() } },
      ),
    ).rejects.toThrow(/Invalid PaymentApproved/);
  });

  it('throws when applyEffects fails', async () => {
    const applyEffects = {
      execute: jest
        .fn()
        .mockResolvedValue(err({ type: 'INVALID_STATE', message: 'bad' })),
    };
    await expect(
      processOrdersSqsEvent(
        {
          Records: [
            {
              messageId: 'm4',
              body: JSON.stringify(event),
              receiptHandle: '',
              attributes: {} as never,
              messageAttributes: {},
              md5OfBody: '',
              eventSource: 'aws:sqs',
              eventSourceARN: '',
              awsRegion: 'us-east-1',
            },
          ],
        },
        { applyEffects },
      ),
    ).rejects.toThrow(/Apply effects failed/);
  });
});
