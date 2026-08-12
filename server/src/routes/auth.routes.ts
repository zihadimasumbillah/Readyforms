import express from 'express';
import { register, login, getCurrentUser, updatePreferences, forgotPassword } from '../controllers/auth.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

router.get('/me', verifyToken as express.RequestHandler, getCurrentUser);
router.put('/preferences', verifyToken as express.RequestHandler, updatePreferences);

export default router;