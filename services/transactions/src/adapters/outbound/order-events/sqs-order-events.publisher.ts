import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import type {
  OrderEventsPublisher,
  PaymentApprovedEvent,
} from '../../../ports/order-events.port';

export class SqsOrderEventsPublisher implements OrderEventsPublisher {
  private readonly client: SQSClient;

  constructor(
    private readonly queueUrl: string,
    client?: SQSClient,
  ) {
    this.client = client ?? new SQSClient({});
  }

  async publishPaymentApproved(event: PaymentApprovedEvent): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: event.type,
          },
        },
      }),
    );
  }
}
