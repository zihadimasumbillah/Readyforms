let app;
try {
  app = require('../dist/src/server').default || require('../dist/src/server').app || require('../dist/src/server');
} catch (e) {
  app = require('../src/server').default || require('../src/server').app || require('../src/server');
}

let dbInitialized = false;

// Global Middleware: CORS & Self-Healing Neon Database Auto-Sync
app.use(async (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Version, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
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
