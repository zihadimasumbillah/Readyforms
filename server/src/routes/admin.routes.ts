import { Router } from 'express';
import { getAdminStats, getSystemActivity, getAllTemplates } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.use(catchAsync(authMiddleware));
router.use(catchAsync(adminMiddleware));

router.get('/stats', catchAsync(getAdminStats));
router.get('/activity', catchAsync(getSystemActivity));
router.get('/templates', catchAsync(getAllTemplates));

export default router;
