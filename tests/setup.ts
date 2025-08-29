// Test setup file
import { config } from 'dotenv';

// Load environment variables for testing
config();

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for API calls
jest.setTimeout(30000);
