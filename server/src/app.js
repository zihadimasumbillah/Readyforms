const express = require('express');
const cors = require('cors');
const app = express();

// Check if we can load routes 
let routes;
try {
  routes = require('./routes').default;
  console.log('✅ Routes loaded successfully from TypeScript');
} catch (error) {
  console.error('❌ Failed to load TypeScript routes:', error.message);
  try {
    // Try loading the JavaScript fallback
    routes = require('./routes/index.js');
    console.log('✅ Routes loaded from JavaScript fallback');
  } catch (jsError) {
    console.error('❌ Failed to load JavaScript routes:', jsError.message);
    // Create basic fallback routes
    routes = require('express').Router();
    routes.get('/', (req, res) => {
      res.status(200).json({ 
        message: 'ReadyForms API Server (Reduced Functionality)',
        status: 'Limited',
        error: 'Route loading issue',
        timestamp: new Date().toISOString() 
      });
    });
    routes.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'limited',
        message: 'Server is responding with limited functionality',
        timestamp: new Date().toISOString() 
      });
    });
    routes.get('/templates', (req, res) => {
      res.status(200).json({
        message: 'Basic templates endpoint',
        data: [],
        fallback: true,
        timestamp: new Date().toISOString()
      });
    });
  }
}

app.use(express.json());

// Simple CORS configuration that works in all environments
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Allow all origins
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With', 'Accept'],
  credentials: false
}));

// Explicitly handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.status(204).end();
});

// Health check route that doesn't require API prefix
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is responding',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

// CORS testing endpoint (not under /api to avoid conflicts)
app.get('/debug-cors', (req, res) => {
  res.json({
    message: 'CORS is configured correctly',
    origin: req.headers.origin || 'No origin',
    env: process.env.NODE_ENV,
    headers: req.headers,
    corsSettings: {
      allowedOrigins: '*'
    }
  });
});

// Mount API routes BEFORE any other /api/* routes
console.log('🔧 Mounting API routes...');
app.use('/api', routes);
console.log('✅ API routes mounted successfully');

// Add a diagnostic endpoint directly in app.js to test if it works
app.get('/api/diagnostic-direct', (req, res) => {
  res.status(200).json({
    message: 'Direct app.js endpoint working!',
    source: 'app.js',
    timestamp: new Date().toISOString(),
    routerMounted: true
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught by global error handler:', err);
  
  // Handle CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      message: 'CORS Error',
      error: err.message,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check if this is a database connection error
  const isDbConnectionError = err.name === 'SequelizeConnectionError' || 
                             err.name === 'SequelizeConnectionRefusedError' ||
                             (err.original && err.original.code === 'ECONNREFUSED') ||
                             err.message.includes('pg package');
  
  if (isDbConnectionError) {
    console.error('Database connection error detected in error handler');
    return res.status(500).json({ 
      message: 'Database connection error',
      error: 'Unable to connect to the database. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    timestamp: new Date().toISOString() 
  });
});

// Add health check directly in the app file as a fallback
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'ReadyForms API Server',
    status: 'Running',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// Export the Express app
module.exports = app;
module.exports.default = app;
