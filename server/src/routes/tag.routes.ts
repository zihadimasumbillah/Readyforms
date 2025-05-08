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
router.get('/', catchAsync(getTags));
router.get('/popular', catchAsync(getPopularTags));
router.get('/famous', catchAsync(getFamousTags));
router.get('/recent', catchAsync(getRecentTags));
router.get('/:id/templates', catchAsync(getTemplatesByTag));
router.post('/template', catchAsync(authMiddleware), catchAsync(addTagToTemplate));
router.delete('/template', catchAsync(authMiddleware), catchAsync(removeTagFromTemplate));
router.post('/', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(createTag));
router.delete('/:id', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(deleteTag));

export default router;