/// <reference path="./types/express.d.ts" />
import bufferModule from 'buffer';
if (!(bufferModule as any).SlowBuffer) {
  (bufferModule as any).SlowBuffer = bufferModule.Buffer;
}

import express from 'express';
import cors from 'cors';


import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import errorHandler from './middleware/error.middleware';
import { sequelize } from './models';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CLIENT_URL ? 
  process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : 
  ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.ALLOW_ALL_ORIGINS === 'true') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: false,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Version']
};

app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('tiny'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts. Please try again later.' },
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

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is responding',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString() 
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    server: 'ReadyForms API',
    env: process.env.NODE_ENV,
    origin: req.headers.origin || 'No origin',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api', routes);

app.use(errorHandler);


const server = app.listen(PORT, () => {
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
        // Development only: sync schema automatically for convenience.
        // In production, run migrations via `npx sequelize-cli db:migrate` instead.
        await sequelize.sync({ alter: true });
        console.info('[DB] Development schema sync completed.');
      } else {
        console.info('[DB] Production mode: skipping auto-sync. Run migrations manually.');
      }
    })
    .catch((error) => {
      console.error('[DB] Unable to connect to the database:', error.message);
    });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
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
});

export default server;
