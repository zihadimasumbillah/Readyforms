import express from 'express';
import * as adminController from '../controllers/admin.controller';
import { getFormResponsesByTemplate } from '../controllers/form-response.controller';
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

router.get('/topics', adminController.getAllTopics);

router.get('/templates', adminController.getAllTemplates);
router.get('/templates/:id', adminController.getTemplateById);
router.get('/templates/:templateId/responses', getFormResponsesByTemplate as express.RequestHandler);
router.delete('/templates/:id', adminController.deleteTemplate);

router.get('/responses', adminController.getAllResponses);
router.get('/responses/:id', adminController.getResponseById);
router.delete('/responses/:id', adminController.deleteResponse);

export default router;

