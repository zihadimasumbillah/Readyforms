import express from 'express';
import cors from 'cors';
import { testConnection } from './models';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import topicRoutes from './routes/topic.routes';
import templateRoutes from './routes/template.routes';
import formResponseRoutes from './routes/form-response.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';

// Load environment variables
dotenv.config();

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

// API health check route at /api/health
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

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // Test database connection
    const isConnected = await testConnection();
    console.log(`Database connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Database connection error:', error);
  }
});

export default app;