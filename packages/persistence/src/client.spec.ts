import { createDynamoClient, createRawDynamoClient, getTableName } from './client';

describe('client', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('defaults table name', () => {
    delete process.env.DYNAMODB_TABLE_NAME;
    expect(getTableName()).toBe('checkout-store');
  });

  it('reads table name from env', () => {
    process.env.DYNAMODB_TABLE_NAME = 'custom-table';
    expect(getTableName()).toBe('custom-table');
  });

  it('creates document client with local endpoint credentials', () => {
    process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
    process.env.AWS_REGION = 'us-east-1';
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    expect(createDynamoClient()).toBeDefined();
    expect(createRawDynamoClient()).toBeDefined();
  });

  it('creates clients without endpoint', () => {
    delete process.env.DYNAMODB_ENDPOINT;
    expect(createDynamoClient()).toBeDefined();
    expect(createRawDynamoClient()).toBeDefined();
  });
});
