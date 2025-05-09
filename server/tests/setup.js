// This file runs before the tests
console.log('Setting up test environment...');

// Set the NODE_ENV to test
process.env.NODE_ENV = 'test';

// Override any config for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ALLOW_ALL_ORIGINS = 'true';

// Suppress most logs during tests
// console.log = jest.fn();

// Export any global setup you need
module.exports = {
  testEnv: true,
};
