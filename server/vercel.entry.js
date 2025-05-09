// Load environment variables
require('dotenv').config();

// Import express
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Initialize express app
const app = express();

// Set up middleware
app.use(express.json());

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://readyformss.vercel.app',
];

if (process.env.CLIENT_URL) {
  const additionalOrigins = process.env.CLIENT_URL.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Version']
}));

app.options('*', cors());

// Add logging in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

// Import routes - we need to handle the case where the default export might be using ES modules syntax
let routes;
try {
  routes = require('./src/routes').default;
} catch (error) {
  console.error('Error importing routes:', error);
  routes = require('./src/routes');
}

app.use('/api', routes);

// Add basic health route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('ReadyForms API is running!');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught by global error handler:', err);
  
  // Check if this is a database connection error
  const isDbConnectionError = err.name === 'SequelizeConnectionError' || 
                             err.name === 'SequelizeConnectionRefusedError' ||
                             (err.original && err.original.code === 'ECONNREFUSED');
  
  if (isDbConnectionError) {
    console.error('Database connection error detected in error handler');
    return res.status(500).json({ 
      message: 'Database connection error',
      error: 'Unable to connect to the database. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    timestamp: new Date().toISOString() 
  });
});

// Export the Express app for Vercel
module.exports = app;
