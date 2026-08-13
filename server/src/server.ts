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

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.ALLOW_ALL_ORIGINS === 'true' || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version', 'X-Requested-With'],
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

// Alias Router for direct un-prefixed paths (e.g. /templates, /topics)
app.use('/', routes);

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
