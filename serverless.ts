import type { AWS } from '@serverless/typescript';
import { observabilityResources } from './infra/observability-resources.cjs';

/**
 * Single Serverless Framework stack = one HTTP API (API Gateway) that routes
 * to all NestJS microservice Lambdas. No custom Node gateway service.
 *
 * Stages:
 * - `dev` / `prod` — shared long-lived environments
 * - `fb-*` — isolated feature stacks (unique DynamoDB table + API URL)
 */
const stage = '${sls:stage}';

const observability = observabilityResources({ stage });

function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  const list = raw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : ['http://localhost:5173'];
}

// @serverless/typescript types lag Lambda runtimes / CFN ${} placeholders.
const serverlessConfiguration = {
  service: 'checkout-api',
  frameworkVersion: '4',
  useDotenv: true,
  plugins: ['serverless-offline'],
  provider: {
    name: 'aws' as const,
    runtime: 'nodejs24.x',
    region: '${env:AWS_REGION, "us-east-1"}',
    stage: '${opt:stage, "dev"}',
    memorySize: 512,
    timeout: 29,
    logs: {
      httpApi: true,
    },
    httpApi: {
      cors: {
        allowedOrigins: corsOrigins(),
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Correlation-Id',
          'X-Request-Id',
        ],
        allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        exposedResponseHeaders: ['X-Correlation-Id'],
      },
    },
    environment: {
      STAGE: stage,
      DYNAMODB_TABLE_NAME: '${self:custom.tableName}',
      DYNAMODB_ENDPOINT: '${env:DYNAMODB_ENDPOINT, ""}',
      PAYMENT_GATEWAY_MODE: '${env:PAYMENT_GATEWAY_MODE, "fake"}',
      PAYMENT_API_URL: '${env:PAYMENT_API_URL, ""}',
      PAYMENT_PUBLIC_KEY: '${env:PAYMENT_PUBLIC_KEY, ""}',
      PAYMENT_PRIVATE_KEY: '${env:PAYMENT_PRIVATE_KEY, ""}',
      PAYMENT_INTEGRITY_KEY: '${env:PAYMENT_INTEGRITY_KEY, ""}',
      PAYMENT_CURRENCY: '${env:PAYMENT_CURRENCY, "COP"}',
      BASE_FEE: '${env:BASE_FEE, "1500"}',
      DELIVERY_FEE: '${env:DELIVERY_FEE, "5000"}',
      ORDERS_EVENTS_QUEUE_URL: {
        Ref: 'CheckoutOrdersEventsQueue',
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:DescribeTable',
            ],
            Resource: [
              { 'Fn::GetAtt': ['CheckoutTable', 'Arn'] },
              {
                'Fn::Join': [
                  '/',
                  [{ 'Fn::GetAtt': ['CheckoutTable', 'Arn'] }, 'index', '*'],
                ],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: [
              'sqs:SendMessage',
              'sqs:ReceiveMessage',
              'sqs:DeleteMessage',
              'sqs:GetQueueAttributes',
            ],
            Resource: [
              { 'Fn::GetAtt': ['CheckoutOrdersEventsQueue', 'Arn'] },
              { 'Fn::GetAtt': ['CheckoutOrdersEventsDlq', 'Arn'] },
            ],
          },
        ],
      },
    },
  },
  custom: {
    defaultTableName: 'checkout-store-${sls:stage}',
    tableName: '${env:DYNAMODB_TABLE_NAME, self:custom.defaultTableName}',
    'serverless-offline': {
      httpPort: 3000,
      lambdaPort: 3005,
      noPrependStageInUrl: true,
    },
  },
  functions: {
    products: {
      handler: 'services/products/dist/lambda.handler',
      environment: {
        SERVICE_NAME: 'products',
        SERVICE_PREFIX: 'products',
      },
      events: [
        { httpApi: { path: '/products', method: 'ANY' } },
        { httpApi: { path: '/products/{proxy+}', method: 'ANY' } },
      ],
    },
    customers: {
      handler: 'services/customers/dist/lambda.handler',
      environment: {
        SERVICE_NAME: 'customers',
        SERVICE_PREFIX: 'customers',
      },
      events: [
        { httpApi: { path: '/customers', method: 'ANY' } },
        { httpApi: { path: '/customers/{proxy+}', method: 'ANY' } },
      ],
    },
    deliveries: {
      handler: 'services/deliveries/dist/lambda.handler',
      environment: {
        SERVICE_NAME: 'deliveries',
        SERVICE_PREFIX: 'deliveries',
      },
      events: [
        { httpApi: { path: '/deliveries', method: 'ANY' } },
        { httpApi: { path: '/deliveries/{proxy+}', method: 'ANY' } },
      ],
    },
    transactions: {
      handler: 'services/transactions/dist/lambda.handler',
      environment: {
        SERVICE_NAME: 'transactions',
        SERVICE_PREFIX: 'transactions',
      },
      events: [
        { httpApi: { path: '/transactions', method: 'ANY' } },
        { httpApi: { path: '/transactions/{proxy+}', method: 'ANY' } },
      ],
    },
    ordersWorker: {
      handler: 'services/transactions/dist/orders-worker.handler',
      timeout: 60,
      environment: {
        SERVICE_NAME: 'orders-worker',
      },
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['CheckoutOrdersEventsQueue', 'Arn'] },
            batchSize: 5,
          },
        },
      ],
    },
  },
  resources: {
    Conditions: observability.Conditions,
    Resources: {
      ...observability.Resources,
      CheckoutTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:custom.tableName}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            { AttributeName: 'pk', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'gsi1pk', AttributeType: 'S' },
            { AttributeName: 'gsi1sk', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'gsi1',
              KeySchema: [
                { AttributeName: 'gsi1pk', KeyType: 'HASH' },
                { AttributeName: 'gsi1sk', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
          Tags: [
            { Key: 'Service', Value: 'checkout-api' },
            { Key: 'Stage', Value: stage },
          ],
        },
      },
      CheckoutOrdersEventsDlq: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'checkout-orders-events-dlq-${sls:stage}',
          MessageRetentionPeriod: 1209600,
        },
      },
      CheckoutOrdersEventsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'checkout-orders-events-${sls:stage}',
          VisibilityTimeout: 120,
          RedrivePolicy: {
            deadLetterTargetArn: {
              'Fn::GetAtt': ['CheckoutOrdersEventsDlq', 'Arn'],
            },
            maxReceiveCount: 3,
          },
        },
      },
    },
    Outputs: {
      ...observability.Outputs,
      CheckoutTableName: {
        Description: 'Single-table DynamoDB name',
        Value: { Ref: 'CheckoutTable' },
        Export: {
          Name: 'checkout-api-${sls:stage}-CheckoutTableName',
        },
      },
      OrdersEventsQueueUrl: {
        Description: 'SQS queue for PaymentApproved events',
        Value: { Ref: 'CheckoutOrdersEventsQueue' },
      },
      StageName: {
        Description: 'Deployed Serverless stage',
        Value: stage,
      },
    },
  },
} as unknown as AWS;

module.exports = serverlessConfiguration;
