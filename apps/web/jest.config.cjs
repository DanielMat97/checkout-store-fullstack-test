const path = require('node:path');

const reactRoot = path.dirname(require.resolve('react/package.json'));
const reactDomRoot = path.dirname(require.resolve('react-dom/package.json'));

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '^react$': path.join(reactRoot, 'index.js'),
    '^react/(.*)$': path.join(reactRoot, '$1'),
    '^react-dom$': path.join(reactDomRoot, 'index.js'),
    '^react-dom/(.*)$': path.join(reactDomRoot, '$1'),
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
    'src/features/orders/**/*.ts',
    'src/mocks/**/*.ts',
    'src/store/checkoutSlice.ts',
    'src/design-system/format.ts',
    'src/design-system/withViewTransition.ts',
    'src/publicEnv.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
