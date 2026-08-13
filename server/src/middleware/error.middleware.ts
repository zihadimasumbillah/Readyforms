import { Request, Response, NextFunction } from 'express';

const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.error('Error caught by global error handler:', err);

  if (err.message && err.message.includes('Not allowed by CORS')) {
    res.status(403).json({
      message: 'Access denied',
      time: new Date().toISOString()
      // SECURITY: Do NOT echo req.headers.origin — it is attacker-controlled
      // and leaks information about CORS configuration
    });
    return;
  }

  // Handle database connection errors
  if (
    err.name === 'SequelizeConnectionError' ||
    err.name === 'SequelizeConnectionRefusedError' ||
    (err.original && err.original.code === 'ECONNREFUSED')
  ) {
    res.status(503).json({
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable',
      time: new Date().toISOString()
    });
    return;
  }

  // Handle missing table errors with self-healing DB initialization
  if (err.name === 'SequelizeDatabaseError' && 
      err.parent && 
      err.parent.code === '42P01') {
    
    console.warn('[DB AUTO-HEAL] Missing table detected. Triggering automatic database sync & seed on Neon PostgreSQL...');
    try {
      const { ensureDatabaseInitialized } = require('../utils/seed');
      await ensureDatabaseInitialized();
      res.status(200).json({
        message: 'Database schema was automatically initialized and seeded successfully. Please refresh.',
        status: 'initialized',
        time: new Date().toISOString()
      });
      return;
    } catch (syncErr: any) {
      console.error('[DB AUTO-HEAL] Error during database auto-heal:', syncErr.message);
      res.status(500).json({
        message: 'Database schema is incomplete and auto-initialization failed.',
        error: syncErr.message,
        time: new Date().toISOString()
      });
      return;
    }
  }

  // Handle validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors?.map(e => ({ field: e.path, message: e.message })),
      time: new Date().toISOString()
    });
    return;
  }

  // Handle unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      message: 'Duplicate entry error',
      errors: err.errors?.map(e => ({ field: e.path, message: e.message })),
      time: new Date().toISOString()
    });
    return;
  }

  // Default error response — never expose error internals in production
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    requestId: (req as any).requestId,
    time: new Date().toISOString()
  });
};

export default errorHandler;
