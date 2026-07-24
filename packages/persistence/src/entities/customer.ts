import { Entity } from 'electrodb';

export const customerEntitySchema = {
  model: {
    entity: 'customer',
    version: '1',
    service: 'checkout',
  },
  attributes: {
    customerId: { type: 'string', required: true },
    fullName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    phone: { type: 'string', required: true },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['customerId'],
        template: 'CUSTOMER#${customerId}',
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
        template: 'CUSTOMER',
      },
      sk: {
        field: 'gsi1sk',
        composite: ['customerId'],
        template: '${customerId}',
      },
    },
  },
} as const;

export function createCustomerEntity(
  options: ConstructorParameters<typeof Entity>[1],
): Entity<string, string, string, typeof customerEntitySchema> {
  return new Entity(customerEntitySchema, options);
}
