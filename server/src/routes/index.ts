import express from 'express';
import healthRoutes from './health.routes';
import debugRoutes from './debug.routes';
import templateRoutes from './template.routes';
import authRoutes from './auth.routes';
import commentRoutes from './comment.routes';
import likeRoutes from './like.routes';
import topicRoutes from './topic.routes';
import userRoutes from './user.routes';
import formResponseRoutes from './form-response.routes';
import tagRoutes from './tag.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';
import aiRoutes from './ai.routes';

const router = express.Router();

router.use((req, res, next) => {
  res.header('X-API-Version', process.env.npm_package_version || '1.0.0');
  next();
});

router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/topics', topicRoutes);
router.use('/users', userRoutes);
router.use('/responses', formResponseRoutes);
router.use('/forms', formResponseRoutes);
router.use('/tags', tagRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/health', healthRoutes);
router.use('/debug', debugRoutes);

router.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    api: 'ReadyForms API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    name: 'ReadyForms API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

export default router;
