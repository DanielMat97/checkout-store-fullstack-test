import type { AWS } from '@serverless/typescript';

/**
 * Single Serverless Framework stack = one HTTP API (API Gateway) that routes
 * to all NestJS microservice Lambdas. No custom Node gateway service.
 */
const stage = '${sls:stage}';

const serverlessConfiguration: AWS = {
  service: 'checkout-api',
  frameworkVersion: '4',
  plugins: ['serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: '${env:AWS_REGION, "us-east-1"}',
    stage: '${opt:stage, "dev"}',
    memorySize: 512,
    timeout: 29,
    logs: {
      httpApi: true,
    },
    httpApi: {
      cors: {
        allowedOrigins: ['${env:CORS_ORIGIN, "http://localhost:5173"}'],
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
      DYNAMODB_TABLE_NAME: '${env:DYNAMODB_TABLE_NAME, "checkout-store"}',
    },
  },
  custom: {
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
  },
  resources: {
    Outputs: {
      HttpApiUrl: {
        Description: 'Single API Gateway URL (Serverless HTTP API)',
        Value: {
          'Fn::Sub':
            'https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
