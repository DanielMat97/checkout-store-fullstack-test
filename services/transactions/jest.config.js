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
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/lambda.ts', '!src/**/*.module.ts'],
};
