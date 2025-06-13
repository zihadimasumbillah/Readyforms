import express from 'express';
import { register, login, getCurrentUser, updatePreferences, forgotPassword, checkAuth } from '../controllers/auth.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check', checkAuth);
router.post('/forgot-password', forgotPassword);

router.get('/me', verifyToken, getCurrentUser);
router.put('/preferences', verifyToken, updatePreferences);

export default router;