import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { sequelize } from './models';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3000',                   
  'https://readyformss.vercel.app',          
  'https://readyforms.vercel.app'           
];

if (process.env.CLIENT_URL) {
  const additionalOrigins = process.env.CLIENT_URL.split(',').map(origin => origin.trim());
  allowedOrigins.push(...additionalOrigins);
}

console.log('CORS allowed origins:', allowedOrigins);

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

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
}

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('ReadyForms API is running!');
});


const startServer = async () => {
  try {
    console.log('Syncing database schema...');
    await sequelize.sync();

    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      console.log(`Client URL: ${process.env.CLIENT_URL || 'Not specified in .env'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();

export default app;
