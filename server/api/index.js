// Serverless entry point for Vercel
const app = require('../dist/src/app').default;

// Add a custom CORS handler for serverless environment
app.use((req, res, next) => {
  // For API health checks and ping endpoints, allow all origins
  if (req.path === '/api/health' || req.path === '/api/health/ping' || req.path === '/health') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
  }
  next();
});

// Special permissive CORS direct endpoint (not through API routes)
app.get('/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    message: 'CORS test is working',
    origin: req.headers.origin || 'No origin',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app
module.exports = app;
