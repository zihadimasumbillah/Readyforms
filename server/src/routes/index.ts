import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import templateRoutes from './template.routes';
import topicRoutes from './topic.routes';
import tagRoutes from './tag.routes';
import formResponseRoutes from './form-response.routes';
import commentRoutes from './comment.routes';
import likeRoutes from './like.routes';
import adminRoutes from './admin.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';

const router = Router();

// Debug middleware to log route access
router.use((req, res, next) => {
  console.log(`API Route accessed: ${req.method} ${req.path}`);
  next();
});

// Health check route
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.status(200).json({
    message: 'API debug endpoint',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    routes: [
      '/api/auth/*',
      '/api/users/*', 
      '/api/templates/*', 
      '/api/topics/*',
      '/api/tags/*',
      '/api/responses/*',
      '/api/comments/*',
      '/api/likes/*',
      '/api/admin/*',
      '/api/dashboard/*',
      '/api/health/*'
    ]
  });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/templates', templateRoutes);
router.use('/topics', topicRoutes);
router.use('/tags', tagRoutes);
router.use('/responses', formResponseRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);

// Add a fallback route
router.use('*', (req, res) => {
  res.status(404).json({
    message: 'API route not found',
    path: req.originalUrl
  });
});

export default router;
