import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test' 
  ? '.env.test' 
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import sequelize from './config/database';
import routes from './routes';
import errorHandler from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultLocalOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const effectiveAllowedOrigins = [...new Set([...defaultLocalOrigins, ...allowedOrigins])];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      if (effectiveAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
    if (effectiveAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://readyforms-api.vercel.app"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('tiny'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'AI generation rate limit reached. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many OTP requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/send-otp', otpRateLimiter);
app.use('/api/auth/verify-otp', otpRateLimiter);
app.use('/api/ai', aiLimiter);

// Root information endpoint
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

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is responding',
    env: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString() 
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    server: 'ReadyForms API',
    env: process.env.NODE_ENV || 'production',
    origin: req.headers.origin || 'No origin',
    timestamp: new Date().toISOString() 
  });
});

// Primary API Router
app.use('/api', routes);

app.use(errorHandler);

let server: any = null;

if (process.env.VERCEL !== '1') {
  server = app.listen(PORT, () => {
    console.info(`[STARTUP] Server running on port ${PORT}`);
    console.info(`[STARTUP] Environment: ${process.env.NODE_ENV}`);
    console.info(
      `[STARTUP] CORS allowed origins: ${
        process.env.ALLOW_ALL_ORIGINS === 'true' ? 'ALL (WARNING: insecure)' : allowedOrigins.join(', ')
      }`
    );

    sequelize
      .authenticate()
      .then(async () => {
        console.info('[DB] Connection established successfully.');

        if (process.env.NODE_ENV !== 'production') {
          await sequelize.sync({ alter: true });
          console.info('[DB] Development schema sync completed.');
        } else {
          console.info('[DB] Production mode: skipping auto-sync.');
        }
      })
      .catch((error) => {
        console.error('[DB] Unable to connect to the database:', error.message);
      });
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
        sequelize.close()
          .then(() => {
            console.log('Database connection closed');
            process.exit(0);
          })
          .catch(error => {
            console.error('Error closing database connection:', error);
            process.exit(1);
          });
      });
    }
  });
} else {
  // On Vercel serverless environment, trigger background DB authentication & schema initialization
  sequelize.authenticate()
    .then(async () => {
      console.info('[DB Serverless] Connection established successfully.');
      try {
        const { ensureDatabaseInitialized } = require('./utils/seed');
        await ensureDatabaseInitialized();
      } catch (err: any) {
        console.error('[DB Serverless] Auto-sync error:', err.message);
      }
    })
    .catch((err) => console.error('[DB Serverless] Connection failed:', err.message));
}

export { app, server };
export default app;
