export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.jest.test.js'],
  verbose: true,
  collectCoverage: false,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  globals: {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder
  }
};