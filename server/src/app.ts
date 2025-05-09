import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Configure CORS
const corsOptions = {
  origin: function(origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      // Allow all origins in development or testing environments
      return callback(null, true);
    }

    const allowedOrigins = (process.env.CLIENT_URL || '').split(',');
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS policy`);
      // Allow all origins temporarily while debugging CORS issues
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is operational',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API ping endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    server: 'ReadyForms API',
    timestamp: new Date().toISOString() 
  });
});

// Mount API routes
app.use('/api', routes);

// Root path handler for serverless environments
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'ReadyForms API Server',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  console.error('Error caught by global error handler:', err);
  
  // Handle CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    res.status(403).json({
      message: 'CORS Error',
      error: err.message,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Check if this is a database connection error
  const isDbConnectionError = err.name === 'SequelizeConnectionError' || 
                             err.name === 'SequelizeConnectionRefusedError' ||
                             (err.original && err.original.code === 'ECONNREFUSED');
  
  if (isDbConnectionError) {
    console.error('Database connection error detected in error handler');
    res.status(500).json({ 
      message: 'Database connection error',
      error: 'Unable to connect to the database. Please try again later.',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    timestamp: new Date().toISOString() 
  });
});

// Export as module.exports for CommonJS compatibility (needed for supertest)
export default app;
module.exports = app;
