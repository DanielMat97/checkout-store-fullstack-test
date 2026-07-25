const serviceCoverage = {
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
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};

module.exports = serviceCoverage;
