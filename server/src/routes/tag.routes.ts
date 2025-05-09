import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';
import authMiddleware from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = Router();

/**
 * @route GET /api/tags
 * @desc 
 * @access 
 */
router.get('/', tagController.getAllTags);

/**
 * @route POST /api/tags
 * @desc 
 * @access 
 */
router.post(
  '/',
  authMiddleware as any,
  adminMiddleware as any,
  tagController.createTag
);

/**
 * @route PUT /api/tags/:id
 * @desc 
 * @access 
 */
router.put(
  '/:id',
  authMiddleware as any,
  adminMiddleware as any,
  tagController.updateTag
);

/**
 * @route DELETE /api/tags/:id
 * @desc 
 * @access 
 */
router.delete(
  '/:id',
  authMiddleware as any,
  adminMiddleware as any,
  tagController.deleteTopic
);

export default router;