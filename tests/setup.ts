/**
 * Jest test setup file
 * Configures global test environment for the MCP Agent Kit
 */

import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set test environment defaults
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test timeout (10 seconds)
jest.setTimeout(10000);

// Mock external APIs during tests
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Setup global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests but keep error/warn
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};
