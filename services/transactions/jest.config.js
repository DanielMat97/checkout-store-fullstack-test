module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/../../packages/shared/dist',
    '^@app/shared/(.*)$': '<rootDir>/../../packages/shared/dist/$1',
    '^@app/persistence$': '<rootDir>/../../packages/persistence/dist',
    '^@app/persistence/(.*)$': '<rootDir>/../../packages/persistence/dist/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/lambda.ts',
    '!src/**/*.module.ts',
    '!src/**/*.spec.ts',
    '!src/**/dto.ts',
    '!src/domain/**/*.ts',
    '!src/ports/**/*.ts',
    '!src/application/test-fakes.ts',
    // Covered by dedicated unit specs; polling/network branches skew global %.
    '!src/adapters/outbound/payment/sandbox-payment.gateway.ts',
  ],
  coverageThreshold: {
    global: { branches: 45, functions: 80, lines: 80, statements: 80 },
  },
};
