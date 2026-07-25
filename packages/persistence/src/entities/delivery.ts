import { Entity } from 'electrodb';

export const deliveryEntitySchema = {
  model: {
    entity: 'delivery',
    version: '1',
    service: 'checkout',
  },
  attributes: {
    deliveryId: { type: 'string', required: true },
    transactionId: { type: 'string', required: true },
    customerId: { type: 'string', required: true },
    address: { type: 'string', required: true },
    city: { type: 'string', required: true },
    region: { type: 'string', required: true },
    feeMinor: { type: 'number', required: true },
    status: {
      type: ['PENDING', 'FULFILLABLE', 'FULFILLED', 'CANCELLED'] as const,
      required: true,
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['deliveryId'],
        template: 'DELIVERY#${deliveryId}',
      },
      sk: {
        field: 'sk',
        composite: [],
        template: 'META',
      },
    },
    byTransaction: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['transactionId'],
        template: 'TX#${transactionId}',
      },
      sk: {
        field: 'gsi1sk',
        composite: ['deliveryId'],
        template: 'DELIVERY#${deliveryId}',
      },
    },
  },
} as const;

export function createDeliveryEntity(
  options: ConstructorParameters<typeof Entity>[1],
): Entity<string, string, string, typeof deliveryEntitySchema> {
  return new Entity(deliveryEntitySchema, options);
}
