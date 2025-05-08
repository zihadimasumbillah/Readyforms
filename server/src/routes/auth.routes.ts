import { Router } from 'express';
import { register, login, getCurrentUser, updatePreferences } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

router.post('/register', catchAsync(register));
router.post('/login', catchAsync(login));

router.get('/me', catchAsync(authMiddleware), catchAsync(getCurrentUser));
router.put('/preferences', catchAsync(authMiddleware), catchAsync(updatePreferences));

export default router;