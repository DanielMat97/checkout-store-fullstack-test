import { Entity } from 'electrodb';

export const transactionEntitySchema = {
  model: {
    entity: 'transaction',
    version: '1',
    service: 'checkout',
  },
  attributes: {
    transactionId: { type: 'string', required: true },
    status: {
      type: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'REFUNDED'] as const,
      required: true,
    },
    productId: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    productAmount: { type: 'number', required: true },
    baseFee: { type: 'number', required: true },
    deliveryFee: { type: 'number', required: true },
    total: { type: 'number', required: true },
    providerRef: { type: 'string' },
    createdAt: { type: 'string', required: true },
    deliveryId: { type: 'string' },
    effectsApplied: { type: 'boolean' },
    stockRestoredAt: { type: 'string' },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['transactionId'],
        template: 'TX#${transactionId}',
      },
      sk: {
        field: 'sk',
        composite: [],
        template: 'META',
      },
    },
    byType: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: [],
        template: 'TX',
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt', 'transactionId'],
        template: '${createdAt}#${transactionId}',
      },
    },
  },
} as const;

export function createTransactionEntity(
  options: ConstructorParameters<typeof Entity>[1],
): Entity<string, string, string, typeof transactionEntitySchema> {
  return new Entity(transactionEntitySchema, options);
}
