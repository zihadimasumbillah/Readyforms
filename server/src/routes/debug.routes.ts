import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Define valid routes with proper path format
router.get('/status', (req, res) => {
  res.json({ status: 'Debug mode active' });
});

router.get('/info', (req, res) => {
  res.json({ 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// Protected debug routes
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected debug endpoint', user: req.user });
});

router.get('/admin-only', authMiddleware, isAdmin, (req, res) => {
  res.json({ message: 'This is an admin-only debug endpoint' });
});

// Remove any invalid routes that might have URL patterns like https://git.new/pathToRegexpError

export default router;
