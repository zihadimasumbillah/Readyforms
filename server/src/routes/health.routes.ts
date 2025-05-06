import { Router } from 'express';
import { checkEndpoints, getSystemHealth } from '../controllers/health.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Public health route is already defined in server.ts
// These are more detailed checks for authenticated users

// Basic health check doesn't need authentication
router.get('/check', catchAsync(checkEndpoints));

// System health needs admin privileges
router.get('/system', 
  catchAsync(authMiddleware),
  catchAsync(adminMiddleware),
  catchAsync(getSystemHealth)
);

export default router;
