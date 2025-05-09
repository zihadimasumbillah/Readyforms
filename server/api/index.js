// Serverless API entry point for Vercel deployment
require('dotenv').config();
const app = require('../dist/src/app');

// Export a serverless function handler for Vercel
module.exports = async (req, res) => {
  // Forward the request to our Express app
  return app(req, res);
};
