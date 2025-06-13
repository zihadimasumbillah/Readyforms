import express from 'express';
import { toggleLike, checkLike, countLikes, getLikesByTemplate } from '../controllers/like.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();


router.post('/template/:templateId', verifyToken, toggleLike);
router.delete('/template/:templateId', verifyToken, toggleLike);

router.get('/check/:templateId', verifyToken, checkLike);

router.get('/count/:templateId', countLikes);

router.get('/template/:templateId', getLikesByTemplate);

export default router;