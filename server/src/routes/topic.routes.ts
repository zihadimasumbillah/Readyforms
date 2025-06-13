import express from 'express';
import { getAllTopics, getTopicById, createTopic, updateTopic, deleteTopic } from '../controllers/topic.controller';
import verifyToken from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', getAllTopics);
router.get('/:id', getTopicById);

router.post('/', [verifyToken, adminMiddleware], createTopic);
router.put('/:id', [verifyToken, adminMiddleware], updateTopic);
router.delete('/:id', [verifyToken, adminMiddleware], deleteTopic);

export default router;