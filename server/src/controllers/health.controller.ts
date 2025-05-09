import { Request, Response } from 'express';
import { testConnection } from '../models';
import catchAsync from '../utils/catchAsync';
import os from 'os';

/**
 * Basic health check endpoint
 * @route GET /api/health
 */
export const healthCheck = catchAsync(async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  });
});

/**
 * Detailed system health information
 * @route GET /api/health/system
 */
export const systemHealth = catchAsync(async (_req: Request, res: Response) => {
  try {
    const dbConnection = await testConnection();
    
    const healthData = {
      status: dbConnection ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: dbConnection,
        message: dbConnection ? 'Database connection successful' : 'Database connection failed'
      },
      system: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usage: (1 - os.freemem() / os.totalmem()) * 100
        },
        cpus: os.cpus().length
      }
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Failed to retrieve health information'
    });
  }
});

/**
 * Authentication health check (requires auth)
 * @route GET /api/health/auth
 */
export const authHealthCheck = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      authenticated: false,
      message: 'Not authenticated'
    });
  }
  
  res.status(200).json({
    status: 'ok',
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});
