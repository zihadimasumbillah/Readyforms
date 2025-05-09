import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/recent', dashboardController.getRecentActivity);
router.get('/templates', dashboardController.getUserTemplates);
router.get('/responses', dashboardController.getUserResponses);

export default router;
