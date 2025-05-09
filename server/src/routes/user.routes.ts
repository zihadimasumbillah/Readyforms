import { Router } from 'express';
import { getAllUsers, toggleUserBlock, toggleUserAdmin } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Apply middleware to all routes - first auth then admin check
router.use(catchAsync(authMiddleware));
router.use(catchAsync(adminMiddleware));

// Admin-only routes
router.get('/', catchAsync(getAllUsers));
router.put('/:userId/block', catchAsync(toggleUserBlock));
router.put('/:userId/admin', catchAsync(toggleUserAdmin));

export default router;