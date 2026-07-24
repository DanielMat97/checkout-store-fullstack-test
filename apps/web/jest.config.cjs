module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    'src/api/**/*.ts',
    'src/features/checkout/**/*.ts',
    'src/mocks/**/*.ts',
    'src/store/checkoutSlice.ts',
    'src/design-system/format.ts',
    'src/design-system/withViewTransition.ts',
    'src/publicEnv.ts',
    '!src/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
  },
};
