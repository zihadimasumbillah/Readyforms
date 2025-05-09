// This file wraps the main server entrypoint to provide better error handling for Vercel

const dotenv = require('dotenv');
dotenv.config();

// Print all environment variables for debugging (in development only)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment variables:', Object.keys(process.env).reduce((acc, key) => {
    if (key.includes('DATABASE') || key.includes('DB_') || key.includes('NODE_ENV')) {
      const value = process.env[key];
      acc[key] = value && value.length > 15 ? value.substring(0, 10) + '...' : value;
    }
    return acc;
  }, {}));
}

try {
  // Validate critical environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('ERROR: DATABASE_URL environment variable is required');
  }

  // If all validations pass, load the main application
  console.log('Starting ReadyForms API server with validated environment');
  const app = require('./dist/server');
  module.exports = app;
} catch (error) {
  console.error('FATAL ERROR in vercel.entry.js:', error);
  
  // Create a minimal Express app to return the error
  const express = require('express');
  const app = express();
  
  app.use((req, res) => {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'The server is improperly configured. Please check the logs.',
      timestamp: new Date().toISOString()
    });
  });
  
  module.exports = app;
}
