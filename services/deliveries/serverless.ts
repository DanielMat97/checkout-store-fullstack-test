/**
 * Domain Lambda artifact only — HTTP API events live in services/gateway/serverless.ts
 * (single API Gateway entrypoint). Do not attach a separate API Gateway here.
 */
const serverlessConfiguration = {
  service: 'checkout-deliveries-fn',
  frameworkVersion: '4',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    memorySize: 512,
    timeout: 29,
    environment: {
      SERVICE_NAME: 'deliveries',
      SERVICE_PREFIX: 'deliveries',
      DYNAMODB_TABLE_NAME: '${env:DYNAMODB_TABLE_NAME, "checkout-store"}',
    },
  },
  functions: {
    api: {
      handler: 'dist/lambda.handler',
    },
  },
  package: {
    patterns: ['dist/**', '!**/*.ts', '!src/**'],
  },
};

module.exports = serverlessConfiguration;
