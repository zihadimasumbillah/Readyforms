import { Router } from 'express';
import { getAllTemplates, getTemplateById, createTemplate, 
         updateTemplate, deleteTemplate, searchTemplates } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/search', searchTemplates);
router.get('/:id', getTemplateById);

// Protected routes
router.use(authMiddleware);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;