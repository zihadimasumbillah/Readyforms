// Import required dotenv at the very beginning
require('dotenv').config();pp').default;
// Wrap in a try-catch to help debug serverless function crashes
try {
  // Check if we're running in a serverless environment
  console.log('Starting Vercel serverless function');
  console.log('Node environment:', process.env.NODE_ENV);
  
  // Set Vercel flag explicitly for server.ts
  process.env.VERCEL = '1';
  
  // Get the Express app from the compiled output
  const app = require('../dist/src/app').default;
  
  // Export the Express app for Vercel serverless function
  module.exports = app;
  
  console.log('Serverless function adapter initialized successfully');
} catch (error) {
  console.error('Error in serverless function initialization:', error);
  
  // Return a simple Express handler that returns the error
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Internal Server Error - Function initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  };
}
