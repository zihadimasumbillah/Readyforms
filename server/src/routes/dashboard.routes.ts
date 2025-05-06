import { Router } from 'express';
import { getUserStats, getUserTemplates, getUserResponses, getRecentActivity } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// All dashboard routes require authentication
router.use(catchAsync(authMiddleware));

router.get('/stats', catchAsync(getUserStats));
router.get('/templates', catchAsync(getUserTemplates));
router.get('/responses', catchAsync(getUserResponses));
router.get('/activity', catchAsync(getRecentActivity));

export default router;
