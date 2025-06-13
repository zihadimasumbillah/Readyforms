import express from 'express';
import { getAllUsers, toggleUserBlock, toggleUserAdmin } from '../controllers/user.controller';
import verifyToken from '../middleware/auth.middleware';
import adminMiddleware from '../middleware/admin.middleware';

const router = express.Router();

router.get('/', [verifyToken, adminMiddleware], getAllUsers);
router.post('/:id/toggle-block', [verifyToken, adminMiddleware], toggleUserBlock);
router.post('/:id/toggle-admin', [verifyToken, adminMiddleware], toggleUserAdmin);

export default router;