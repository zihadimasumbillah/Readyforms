// Serverless API entry point for Vercel deployment
require('dotenv').config();

// Add error handling for module loading
let app;
try {
  app = require('../dist/src/app');
} catch (error) {
  console.error('Failed to load app module:', error);
  // Create a minimal express-like handler for errors
  app = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Server initialization failed',
      message: 'The server encountered an error during initialization',
      status: 'error',
      timestamp: new Date().toISOString()
    }));
  };
}

// Export a serverless function handler for Vercel
module.exports = async (req, res) => {
  // Simple health check that will work even if the app fails to load
  if (req.url === '/health' || req.url === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'up',
      message: 'Server is responding',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Forward the request to our Express app
  return app(req, res);
};
