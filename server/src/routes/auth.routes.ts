import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updatePreferences, 
  forgotPassword, 
  sendOTP, 
  verifyOTP, 
  updateProfile 
} from '../controllers/auth.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);

router.get('/me', verifyToken as express.RequestHandler, getCurrentUser);
router.put('/preferences', verifyToken as express.RequestHandler, updatePreferences);
router.put('/profile', verifyToken as express.RequestHandler, updateProfile);

export default router;