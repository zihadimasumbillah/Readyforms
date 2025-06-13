import { Router, Request, Response, NextFunction } from 'express';
// import { User, Template, Topic, Tag } from '../models';
// import bcrypt from 'bcryptjs';

const router = Router();

// Always allow basic test endpoints regardless of environment
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Debug test endpoint is working',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

router.get('/env-check', (req, res) => {
  res.status(200).json({
    environment: process.env.NODE_ENV || 'development',
    hasDbUrl: !!process.env.DATABASE_URL,
    hasClientUrl: !!process.env.CLIENT_URL,
    timestamp: new Date().toISOString()
  });
});

// Allow all debug routes in all environments for now
// Production restrictions can be added later if needed

// Temporarily disable database-dependent routes
router.post('/ensure-test-users', async (req: Request, res: Response) => {
  res.status(501).json({
    message: 'Database-dependent routes temporarily disabled',
    reason: 'Testing route loading without database dependencies'
  });
});

router.get('/info', async (req: Request, res: Response) => {
  res.status(501).json({
    message: 'Database-dependent routes temporarily disabled', 
    reason: 'Testing route loading without database dependencies'
  });
});

export default router;
