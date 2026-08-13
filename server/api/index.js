let app;
try {
  app = require('../dist/src/server').default || require('../dist/src/server').app || require('../dist/src/server');
} catch (e) {
  app = require('../src/server').default || require('../src/server').app || require('../src/server');
}

let dbInitialized = false;

// Global Middleware: CORS, URL Rewriting & Self-Healing Neon Database Auto-Sync
app.use(async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Version, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Auto-rewrite un-prefixed requests like /templates -> /api/templates
  if (req.path !== '/' && req.path !== '/health' && req.path !== '/ping' && req.path !== '/cors-test') {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
  }

  if (!dbInitialized) {
    dbInitialized = true;
    try {
      let seedModule;
      try {
        seedModule = require('../dist/src/utils/seed');
      } catch (err) {
        seedModule = require('../src/utils/seed');
      }
      if (seedModule && seedModule.ensureDatabaseInitialized) {
        seedModule.ensureDatabaseInitialized()
          .then(res => console.info('[Vercel DB Auto-Sync]:', res))
          .catch(err => console.error('[Vercel DB Auto-Sync Error]:', err.message));
      }
    } catch (err) {
      console.error('[Vercel DB Load Error]:', err.message);
    }
  }

  next();
});

// Root metadata endpoint for Vercel
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ReadyForms API Server',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to ReadyForms backend API service',
    documentation: 'https://readyforms.vercel.app',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      root: '/',
      health: '/health',
      ping: '/ping',
      topics: '/api/topics',
      templates: '/api/templates',
      auth: '/api/auth',
      forms: '/api/forms',
      likes: '/api/likes',
      comments: '/api/comments',
      admin: '/api/admin',
    },
    timestamp: new Date().toISOString()
  });
});

// Direct Seed Route for Manual Initialization
app.get('/api/seed', async (req, res) => {
  try {
    let seedModule;
    try {
      seedModule = require('../dist/src/utils/seed');
    } catch (err) {
      seedModule = require('../src/utils/seed');
    }
    const result = await seedModule.ensureDatabaseInitialized();
    res.status(200).json({ status: 'ok', message: 'Neon Database schema synchronized and seeded', result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Seed failed', error: error.message });
  }
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
