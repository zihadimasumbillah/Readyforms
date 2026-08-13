let app;
try {
  app = require('../dist/src/server').default || require('../dist/src/server').app || require('../dist/src/server');
} catch (e) {
  app = require('../src/server').default || require('../src/server').app || require('../src/server');
}

// Global CORS handler for Vercel Serverless Function
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Version, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Root health check endpoint for Vercel
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS test is working',
    origin: req.headers.origin || 'No origin',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
