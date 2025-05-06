import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './models';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import topicRoutes from './routes/topic.routes';
import templateRoutes from './routes/template.routes';
import formResponseRoutes from './routes/form-response.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route for health check
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to ReadyForms API' });
});

// API health check route that matches the client's expected endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

// Direct health route without /api prefix for flexibility
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/forms', formResponseRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
    
    // Sync database models
    await syncDatabase(false); // Set to true to force sync (CAUTION: Drops all tables!)
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;