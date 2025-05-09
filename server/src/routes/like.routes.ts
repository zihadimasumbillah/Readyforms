import { Router } from 'express';
import { getLikesByTemplate, toggleLike, checkLike, countLikes } from '../controllers/like.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.get('/template/:templateId', catchAsync(getLikesByTemplate));
router.get('/count/:templateId', catchAsync(countLikes));

router.get('/check/:templateId', catchAsync(authMiddleware), catchAsync(checkLike));
router.post('/template/:templateId', catchAsync(authMiddleware), catchAsync(toggleLike));
router.delete('/template/:templateId', catchAsync(authMiddleware), catchAsync(toggleLike));

export default router;