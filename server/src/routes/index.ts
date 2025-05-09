import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import templateRoutes from './template.routes';
import formResponseRoutes from './form-response.routes';
import commentRoutes from './comment.routes';
import likeRoutes from './like.routes';
import topicRoutes from './topic.routes';
import tagRoutes from './tag.routes';
import adminRoutes from './admin.routes';
import debugRoutes from './debug.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';
import catchAsync from '../utils/catchAsync';
import { Request, Response } from 'express';

const router = Router();


router.use('/health', healthRoutes);
router.get('/ping', catchAsync((_req: Request, res: Response) => {
  return res.json({ message: 'pong', timestamp: new Date() });
}));


router.use('/auth', authRoutes);

router.use('/templates', templateRoutes);


router.use('/responses', formResponseRoutes);

router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);

router.use('/topics', topicRoutes);
router.use('/tags', tagRoutes);

router.use('/users', userRoutes);

router.use('/admin', adminRoutes);

router.use('/dashboard', dashboardRoutes);

if (process.env.NODE_ENV !== 'production') {
  router.use('/debug', debugRoutes);
}

export default router;
