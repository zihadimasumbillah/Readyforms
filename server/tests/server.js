// This file creates a server instance specifically for supertest

const app = require('../dist/src/app');
const server = app.listen();

// Export the server for tests to use
module.exports = server;
