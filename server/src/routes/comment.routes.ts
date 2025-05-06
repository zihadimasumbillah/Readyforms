import { Router } from 'express';
import { getCommentsByTemplate, createComment, deleteComment } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.get('/template/:templateId', catchAsync(getCommentsByTemplate));

// Protected routes
router.post('/', catchAsync(authMiddleware), catchAsync(createComment));
router.delete('/:id', catchAsync(authMiddleware), catchAsync(deleteComment));

export default router;