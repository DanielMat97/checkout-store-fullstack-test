import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceInUseException,
} from '@aws-sdk/client-dynamodb';
import { createRawDynamoClient, getTableName } from '../client';
import { buildCheckoutTableInput } from '../table';

async function main(): Promise<void> {
  const tableName = getTableName();
  const client = createRawDynamoClient();

  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Table already exists: ${tableName}`);
    return;
  } catch {
    // create below
  }

  try {
    await client.send(new CreateTableCommand(buildCheckoutTableInput(tableName)));
    console.log(`Created table: ${tableName}`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(`Table already exists: ${tableName}`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
