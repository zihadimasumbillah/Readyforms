import { Router } from 'express';
import { 
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  searchTemplates
} from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();


router.get('/', getAllTemplates);
router.get('/search', searchTemplates);
router.get('/:id', getTemplateById);


router.get('/admin/all', (req, res, next) => {
  authMiddleware(req, res, () => {
    isAdmin(req, res, next);
  });
}, getAllTemplates);

router.post('/', (req, res, next) => {
  authMiddleware(req, res, next);
}, createTemplate);

router.put('/:id', (req, res, next) => {
  authMiddleware(req, res, next);
}, updateTemplate);

router.delete('/:id', (req, res, next) => {
  authMiddleware(req, res, next);
}, deleteTemplate);

export default router;