import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createProductEntity } from './product';
import { createCustomerEntity } from './customer';
import { createDeliveryEntity } from './delivery';
import { createTransactionEntity } from './transaction';

export type CheckoutEntities = ReturnType<typeof createCheckoutEntities>;

export function createCheckoutEntities(
  client: DynamoDBDocumentClient,
  table: string,
) {
  const options = { client, table };
  return {
    products: createProductEntity(options),
    customers: createCustomerEntity(options),
    deliveries: createDeliveryEntity(options),
    transactions: createTransactionEntity(options),
  };
}
