import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  searchTemplates
} from '../controllers/template.controller';
import verifyToken, { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getAllTemplates);
router.get('/search', searchTemplates);

router.get('/:id', optionalAuth as express.RequestHandler, getTemplateById);

router.post('/', verifyToken, createTemplate);

router.put('/:id', verifyToken, updateTemplate);

router.delete('/:id', verifyToken, deleteTemplate);

export default router;