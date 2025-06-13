import express from 'express';
import { getCommentsByTemplate, createComment, deleteComment } from '../controllers/comment.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

router.get('/template/:templateId', getCommentsByTemplate as express.RequestHandler);

router.post('/', verifyToken, createComment);

router.delete('/:id', verifyToken, deleteComment as express.RequestHandler);

export default router;