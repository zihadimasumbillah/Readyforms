import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import errorHandler from './middleware/error.middleware';
import { sequelize } from './models';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = 5000;
const NEXT_PORT = 3000;

const allowedOrigins = process.env.CLIENT_URL ? 
  process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : 
  ['http://localhost:3000'];

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

app.use(
  createProxyMiddleware({
    target: `http://localhost:${NEXT_PORT}`,
    changeOrigin: true,
    ws: true,
    logger: console,
  })
);


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Allowed origins: ${process.env.ALLOW_ALL_ORIGINS === 'true' ? 'All origins' : allowedOrigins.join(', ')}`);

  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
      return sequelize.sync({ alter: true });
    })
    .then(() => {
      console.log('Database tables synced successfully.');
    })
    .catch(error => {
      console.error('Unable to connect to the database:', error);
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
