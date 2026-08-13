// Polyfill legacy SlowBuffer for Node v25 compatibility with buffer-equal-constant-time
const bufferModule = require('buffer');
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Override database connection to use test database
process.env.DB_NAME = process.env.TEST_DB_NAME || 'readyforms_test';

// Create a dedicated test database URL if needed
if (!process.env.TEST_DATABASE_URL) {
  const baseDbUrl = process.env.DATABASE_URL || '';
  if (baseDbUrl) {
    // Replace database name in URL with test database name
    process.env.TEST_DATABASE_URL = baseDbUrl.replace(/\/[^/]+(\?|$)/, '/readyforms_test$1');
  } else {
    // Local connection string
    process.env.TEST_DATABASE_URL = `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/readyforms_test`;
  }
}

// Use the test database URL for the tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Enable detailed logging for tests when needed
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

// Suppress console logs during tests unless explicitly enabled
if (process.env.TEST_LOGS !== 'true') {
  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  // Replace with filtered versions
  console.log = (...args) => {
    // Still allow specific messages through
    if (args[0] && (
      args[0].includes('Test server started') || 
      args[0].includes('Setting up test') ||
      args[0].includes('Test setup complete') ||
      args[0].includes('Test database connection') ||
      args[0].includes('Test server closed') ||
      args[0].includes('Creating test')
    )) {
      originalLog(...args);
    }
  };
  
  console.warn = (...args) => {
    if (args[0] && args[0].includes('test')) {
      originalWarn(...args);
    }
  };
}

// Add global test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Allow all origins in test environment
process.env.ALLOW_ALL_ORIGINS = 'true';

// Set a specific test port if needed
process.env.TEST_PORT = process.env.TEST_PORT || '4000';

console.log('Setting up test environment...');

// Export any test utilities if needed
module.exports = {
  testDbName: process.env.DB_NAME || 'readyforms_test'
};
