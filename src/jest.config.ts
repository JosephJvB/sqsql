/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/tests/**/*.test.ts'],
  // https://jestjs.io/docs/configuration#collectcoveragefrom-array
  // collectCoverageFrom: ['**/*.ts', '!**/tests/helpers.ts', '!**/jest.config.js'],
}