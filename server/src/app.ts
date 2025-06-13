import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import errorHandler from './middleware/error.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Apply middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet({
  // Content security policy disabled temporarily to help with development
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Configure CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.CLIENT_URL?.split(',') || [];
    const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === 'true';
    
    if (allowAllOrigins || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version']
};

app.use(cors(corsOptions));

// Logging middleware
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'ReadyForms API',
    version: '1.0.0',
    health: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple ping endpoint
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Apply API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
