// This file runs before the tests
console.log('Setting up test environment...');

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ALLOW_ALL_ORIGINS = 'true';

// Load environment variables from .env.test if exists
require('dotenv').config({
  path: '.env.test'
});

// Increase timeout for resource-intensive operations
jest.setTimeout(30000);

// Silence console logs during tests unless in verbose mode
if (process.env.VERBOSE_TESTS !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
