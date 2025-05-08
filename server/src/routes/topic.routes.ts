import { Router } from 'express';
import { getAllTopics, createTopic, updateTopic, deleteTopic } from '../controllers/topic.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(getAllTopics));
router.post('/', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(createTopic));
router.put('/:id', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(updateTopic));
router.delete('/:id', catchAsync(authMiddleware), catchAsync(adminMiddleware), catchAsync(deleteTopic));

export default router;