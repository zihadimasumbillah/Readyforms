import express from 'express';
import * as adminController from '../controllers/admin.controller';
import authMiddleware from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = express.Router();

router.use(authMiddleware as express.RequestHandler);
router.use(adminMiddleware as express.RequestHandler);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/block', adminController.toggleUserBlock);
router.put('/users/:id/admin', adminController.toggleUserAdmin);
router.get('/users-count', adminController.getUsersCount);


router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/system-activity', adminController.getSystemActivity);
router.get('/system-activity/:count', adminController.getSystemActivity);

router.get('/templates', adminController.getAllTemplates);
router.get('/templates/:id', adminController.getTemplateById);

router.get('/responses', adminController.getAllResponses);
router.get('/responses/:id', adminController.getResponseById);

export default router;
