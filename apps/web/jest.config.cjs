module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/main.tsx', '!src/vite-env.d.ts'],
};
