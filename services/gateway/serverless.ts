import type { AWS } from '@serverless/typescript';

/**
 * Single API Gateway (HTTP API) entrypoint that routes to domain Lambdas.
 * Deploy this service as the public HTTP edge — not per-microservice gateways.
 */
const region = '${aws:region}';
const stage = '${sls:stage}';

const serverlessConfiguration: AWS = {
  service: 'checkout-gateway',
  frameworkVersion: '4',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    stage: '${opt:stage, "dev"}',
    memorySize: 512,
    timeout: 29,
    logs: {
      httpApi: true,
    },
    httpApi: {
      cors: {
        allowedOrigins: ['${env:CORS_ORIGIN, "*"}'],
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
      SERVICE_NAME: 'api-gateway',
    },
  },
  functions: {
    products: {
      name: 'checkout-${sls:stage}-products',
      handler: '../products/dist/lambda.handler',
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
      name: 'checkout-${sls:stage}-customers',
      handler: '../customers/dist/lambda.handler',
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
      name: 'checkout-${sls:stage}-deliveries',
      handler: '../deliveries/dist/lambda.handler',
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
      name: 'checkout-${sls:stage}-transactions',
      handler: '../transactions/dist/lambda.handler',
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
    Resources: {
      GatewayAccessLogGroup: {
        Type: 'AWS::Logs::LogGroup',
        Properties: {
          LogGroupName: `/aws/apigateway/checkout-gateway-${stage}`,
          RetentionInDays: 14,
        },
      },
    },
    Outputs: {
      HttpApiUrl: {
        Description: 'Single API Gateway entrypoint URL',
        Value: {
          'Fn::Sub': `https://\${HttpApi}.execute-api.${region}.amazonaws.com`,
        },
      },
    },
  },
  package: {
    individually: true,
    patterns: [
      '!**',
      '../products/dist/**',
      '../customers/dist/**',
      '../deliveries/dist/**',
      '../transactions/dist/**',
      '../products/node_modules/**',
      '../customers/node_modules/**',
      '../deliveries/node_modules/**',
      '../transactions/node_modules/**',
      '../../packages/shared/dist/**',
      '../../node_modules/**',
    ],
  },
};

module.exports = serverlessConfiguration;
