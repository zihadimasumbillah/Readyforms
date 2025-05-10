import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middlewares
app.use(helmet({
  // Disable content security policy in development
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

// Get allowed origins from environment variable
const getAllowedOrigins = (): string[] => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const allowedOrigins = clientUrl.split(',').map(url => url.trim());
  
  // Always include localhost origins for development
  if (!allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
  }
  if (!allowedOrigins.includes('https://localhost:3000')) {
    allowedOrigins.push('https://localhost:3000');
  }
  
  // Include Vercel preview URLs
  if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push('https://readyforms.vercel.app');
    allowedOrigins.push('https://readyformss.vercel.app');
    // Vercel preview deployments pattern
    allowedOrigins.push('https://*.vercel.app');
  }
  
  console.log('Allowed origins for CORS:', allowedOrigins);
  return allowedOrigins;
};

// CORS configuration
const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';
app.use(cors({
  origin: allowAllOrigins ? true : (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      if (allowedOrigin.includes('*')) {
        const pattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
        return pattern.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS policy`);
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Special endpoint that doesn't need API prefix - useful for quick health checks
app.get('/health', (req, res) => {
  // Override CORS headers directly on this specific route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({ 
    status: 'ok',
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main API routes
app.use('/api', routes);

// Catch-all route for API routes that don't match
app.all('/api/*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler middleware - make sure it's the last middleware added
// This is a special middleware with 4 parameters
app.use(errorMiddleware);

export default app;
