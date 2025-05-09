module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      // Move ts-jest config here from globals
      isolatedModules: true,
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 30000,
  verbose: true,
  setupFiles: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    // Remove ts-jest config from here
  },
  roots: ['<rootDir>/tests/', '<rootDir>/src/'],
};
