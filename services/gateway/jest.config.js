module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@app/shared$': '<rootDir>/../../packages/shared/dist',
    '^@app/shared/(.*)$': '<rootDir>/../../packages/shared/dist/$1',
  },
};
