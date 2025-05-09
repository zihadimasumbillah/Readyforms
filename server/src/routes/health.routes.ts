import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Basic health check endpoint
 * @route GET /api/health
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'API is healthy', timestamp: new Date().toISOString() });
});

/**
 * Detailed health check endpoint
 * @route GET /api/health/details
 */
router.get('/details', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
