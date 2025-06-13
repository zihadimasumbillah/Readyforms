import { Request, Response } from 'express';
import { sequelize } from '../models';

/**
 * Basic ping endpoint for health check
 * @route GET /api/health/ping
 */
export const ping = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

/**
 * Check database connectivity
 * @route GET /api/health/database
 */
export const checkDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ok',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'production' ? 'Database error' : (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Health status endpoint
 * @route GET /api/health/status
 */
export const status = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    message: 'API health check passed',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};

/**
 * Check CORS configuration
 * @route GET /api/health/cors
 */
export const checkCors = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    message: 'CORS is properly configured',
    origin: req.headers.origin || 'No origin header',
    cors_config: {
      allowed_origins: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : 'All origins',
      allow_all: process.env.ALLOW_ALL_ORIGINS === 'true'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Full system health check
 * @route GET /api/health/full
 */
export const fullCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database
    let dbStatus = 'ok';
    let dbMessage = 'Database connection is healthy';
    
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'error';
      dbMessage = (error as Error).message;
      console.error('Database health check failed during full check:', error);
    }
    
    res.status(200).json({
      api_status: 'ok',
      api_version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        message: dbMessage
      },
      cors: {
        status: 'ok',
        origin: req.headers.origin || 'No origin header'
      },
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Full health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
};

// Default route handler
export default ping;
