// This is the entry point for Vercel deployment
// It loads environment variables and starts the server

// Load environment variables from .env file
require('dotenv').config();

// Import the Express app
const app = require('./src/app');

// Export a Vercel serverless function
module.exports = app;
