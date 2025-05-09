const express = require('express');
const cors = require('cors');
const routes = require('./routes').default;

const app = express();

app.use(express.json());

const corsOptions = {
  origin: function(origin, callback) {
    if (process.env.NODE_ENV === 'test') {
      callback(null, true);
      return;
    }
    const allowedOrigins = process.env.CLIENT_URL ? 
      process.env.CLIENT_URL.split(',') : 
      ['http://localhost:3000'];
      
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use('/api', routes);

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date() });
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

// Add health check directly in the app file as a fallback
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Server is responding',
    timestamp: new Date().toISOString() 
  });
});

module.exports = app;
