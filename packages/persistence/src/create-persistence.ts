import { createDynamoClient, getTableName } from './client';
import { createCheckoutEntities } from './entities';
import { ElectroDbProductRepository } from './repositories/electrodb-product.repository';
import { ElectroDbCustomerRepository } from './repositories/electrodb-customer.repository';
import { ElectroDbDeliveryRepository } from './repositories/electrodb-delivery.repository';
import { ElectroDbTransactionRepository } from './repositories/electrodb-transaction.repository';

export function createPersistence() {
  const table = getTableName();
  const client = createDynamoClient();
  const entities = createCheckoutEntities(client, table);

  return {
    table,
    client,
    entities,
    products: new ElectroDbProductRepository(entities),
    customers: new ElectroDbCustomerRepository(entities),
    deliveries: new ElectroDbDeliveryRepository(entities),
    transactions: new ElectroDbTransactionRepository(entities),
  };
}
