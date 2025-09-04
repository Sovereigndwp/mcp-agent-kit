module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/src/**/*.test.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/agents/btc-mcp-agent/'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/cases/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
};
