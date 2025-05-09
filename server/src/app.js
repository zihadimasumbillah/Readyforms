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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;
