import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './models';
import authRoutes from './routes/auth.routes';
import templateRoutes from './routes/template.routes';
import formResponseRoutes from './routes/form-response.routes';
import topicRoutes from './routes/topic.routes';
import likeRoutes from './routes/like.routes';
import commentRoutes from './routes/comment.routes';
import userRoutes from './routes/user.routes';
import tagRoutes from './routes/tag.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
// Only import debug routes in development
const debugRoutes = process.env.NODE_ENV !== 'production' 
  ? require('./routes/debug.routes').default 
  : null;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Determine the appropriate CORS origin
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
console.log('Setting CORS origin to:', clientUrl);

// Configure CORS
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Version'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/responses', formResponseRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// Only mount debug routes in development
if (debugRoutes && process.env.NODE_ENV !== 'production') {
  try {
    app.use('/api/debug', debugRoutes);
    console.log('Debug routes mounted');
  } catch (error) {
    console.error('Error mounting debug routes, skipping:', error);
  }
}

// Default route
app.get('/', (_req: Request, res: Response) => {
  res.send('ReadyForms API Server');
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Unable to connect to the database. Please check your database configuration.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();