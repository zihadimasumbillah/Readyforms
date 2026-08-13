import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  getCurrentUser, 
  updatePreferences, 
  forgotPassword, 
  sendOTP, 
  verifyOTP, 
  updateProfile,
  googleCallback
} from '../controllers/auth.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP attempts per window
  message: { message: 'Too many OTP requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login', login);
router.post('/google-callback', googleCallback);
router.post('/send-otp', otpRateLimiter, sendOTP);
router.post('/verify-otp', otpRateLimiter, verifyOTP);
router.post('/forgot-password', forgotPassword);

router.get('/me', verifyToken as express.RequestHandler, getCurrentUser);
router.put('/preferences', verifyToken as express.RequestHandler, updatePreferences);
router.put('/profile', verifyToken as express.RequestHandler, updateProfile);

router.get('/error', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'error',
    message: 'Authentication error occurred. Please try logging in again.',
    redirectUrl: '/auth/login',
    timestamp: new Date().toISOString()
  });
});

export default router;