import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export function getTableName(): string {
  return process.env.DYNAMODB_TABLE_NAME ?? 'checkout-store';
}

export function createDynamoClient(): DynamoDBDocumentClient {
  const endpoint = process.env.DYNAMODB_ENDPOINT?.trim();
  const region = process.env.AWS_REGION ?? 'us-east-1';

  const client = new DynamoDBClient({
    region,
    ...(endpoint
      ? {
          endpoint,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
          },
        }
      : {}),
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
}

export function createRawDynamoClient(): DynamoDBClient {
  const endpoint = process.env.DYNAMODB_ENDPOINT?.trim();
  const region = process.env.AWS_REGION ?? 'us-east-1';

  return new DynamoDBClient({
    region,
    ...(endpoint
      ? {
          endpoint,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
          },
        }
      : {}),
  });
}
