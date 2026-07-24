import { Entity } from 'electrodb';

export const productEntitySchema = {
  model: {
    entity: 'product',
    version: '1',
    service: 'checkout',
  },
  attributes: {
    productId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    kicker: { type: 'string', required: true },
    description: { type: 'string', required: true },
    priceMinor: { type: 'number', required: true },
    stock: { type: 'number', required: true },
    imageUrl: { type: 'string', required: true },
    imageAlt: { type: 'string', required: true },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['productId'],
        template: 'PRODUCT#${productId}',
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
        template: 'PRODUCT',
      },
      sk: {
        field: 'gsi1sk',
        composite: ['productId'],
        template: '${productId}',
      },
    },
  },
} as const;

export function createProductEntity(
  options: ConstructorParameters<typeof Entity>[1],
): Entity<string, string, string, typeof productEntitySchema> {
  return new Entity(productEntitySchema, options);
}
