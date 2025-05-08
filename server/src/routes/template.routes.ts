import { Router } from 'express';
import { 
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  searchTemplates
} from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

router.get('/', getAllTemplates); 
router.get('/search', searchTemplates);
router.get('/admin/all', authMiddleware, isAdmin, getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', authMiddleware, createTemplate);
router.put('/:id', authMiddleware, updateTemplate);
router.delete('/:id', authMiddleware, deleteTemplate);

export default router;