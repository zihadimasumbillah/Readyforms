import { Router } from 'express';
import { 
  getTags, 
  getPopularTags, 
  getFamousTags, 
  getRecentTags, 
  getTemplatesByTag,
  createTag, 
  addTagToTemplate, 
  removeTagFromTemplate,
  deleteTag 
} from '../controllers/tag.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Public routes
router.get('/', catchAsync(getTags));
router.get('/popular', catchAsync(getPopularTags));
router.get('/famous', catchAsync(getFamousTags));
router.get('/recent', catchAsync(getRecentTags));
router.get('/:id/templates', catchAsync(getTemplatesByTag));

// Auth required routes
router.post('/', catchAsync(authMiddleware), catchAsync(createTag));
router.post('/template', catchAsync(authMiddleware), catchAsync(addTagToTemplate));
router.delete('/template', catchAsync(authMiddleware), catchAsync(removeTagFromTemplate));

// Admin required routes
router.delete('/:id', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(deleteTag));

export default router;