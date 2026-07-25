import type {
  OrderEventsPublisher,
  PaymentApprovedEvent,
} from '../../../ports/order-events.port';
import { SqsOrderEventsPublisher } from './sqs-order-events.publisher';

describe('SqsOrderEventsPublisher', () => {
  it('sends PaymentApproved to SQS', async () => {
    const send = jest.fn().mockResolvedValue({});
    const client = { send } as never;
    const publisher: OrderEventsPublisher = new SqsOrderEventsPublisher(
      'https://sqs.example/queue',
      client,
    );
    const event: PaymentApprovedEvent = {
      type: 'PaymentApproved',
      transactionId: 'tx_1',
      deliveryId: 'del_1',
      productId: 'prod_1',
      qty: 1,
    };
    await publisher.publishPaymentApproved(event);
    expect(send).toHaveBeenCalled();
    const cmd = send.mock.calls[0][0];
    expect(cmd.input.QueueUrl).toBe('https://sqs.example/queue');
    expect(JSON.parse(cmd.input.MessageBody)).toEqual(event);
  });
});
