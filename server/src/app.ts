import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: function(origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      // Allow all origins in development or special testing environments
      return callback(null, true);
    }

    const allowedOrigins = (process.env.CLIENT_URL || '').split(',');
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Temporarily allow all origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Mount API routes
app.use('/api', routes);

// Root path handler for Vercel
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

// Error handler - Note the 4 parameters are required
app.use(errorHandler);

export default app;
