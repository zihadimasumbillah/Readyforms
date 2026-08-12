import express, { Router, Request, Response, NextFunction } from 'express';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

// In production, all debug endpoints return 404 to avoid revealing implementation details.
// Never expose request headers, environment info, or internal state in production.
router.use(((_req: Request, res: Response, next: NextFunction) => {
  if (isProd) {
    return res.status(404).json({ message: 'Not found' });
  }
  return next();
}) as express.RequestHandler);

// Development-only: basic connectivity test (strips headers to avoid leaking in shared envs)
router.get('/test', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Debug test endpoint is working',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Development-only: check which env vars are present (never reveals values)
router.get('/env-check', (_req: Request, res: Response) => {
  res.status(200).json({
    environment: process.env.NODE_ENV || 'development',
    hasDbUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasClientUrl: !!process.env.CLIENT_URL,
    timestamp: new Date().toISOString(),
  });
});

router.post('/ensure-test-users', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
});

router.get('/info', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented' });
});

export default router;

