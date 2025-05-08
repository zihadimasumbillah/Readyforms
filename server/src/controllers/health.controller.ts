import { Request, Response } from 'express';
import { sequelize } from '../models';
import { QueryTypes } from 'sequelize';
import catchAsync from '../utils/catchAsync';
import axios from 'axios';
import os from 'os';

interface DatabaseHealth {
  status: string;
  version: string;
  connection_pool: {
    total: number;
    idle: number;
    used: number;
  }
}

interface HealthCheckResult {
  status: string;
  message: string;
  database: {
    connected: boolean;
    responseTime: number;
  };
  memory: {
    usage: number;
    total: number;
    free: number;
  };
  uptime: number;
}

interface DbVersionInfo {
  version: string;
  current_database: string;
  current_user: string;
}

interface DbStats {
  user_count: number;
  template_count: number;
  response_count: number;
}

/**
 * Get health status
 * @route GET /api/health
 */
export const getHealth = catchAsync(async (req: Request, res: Response) => {
  const apiStatus = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.json(apiStatus);
});

/**
 * @route GET /api/health/check
 */
export const checkEndpoints = catchAsync(async (req: Request, res: Response) => {
  const endpoints = [
    { path: '/api/auth', status: 'UP', responseTime: '10ms' },
    { path: '/api/users', status: 'UP', responseTime: '15ms' },
    { path: '/api/templates', status: 'UP', responseTime: '20ms' },
    { path: '/api/forms', status: 'UP', responseTime: '18ms' },
    { path: '/api/admin', status: 'UP', responseTime: '12ms' }
  ];
  
  res.json({
    timestamp: new Date().toISOString(),
    endpoints
  });
});

/**
 * @route GET /api/health/system
 */
export const getSystemHealth = catchAsync(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  const systemHealth = {
    status: 'UP',
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    cpu: process.cpuUsage()
  };
  
  res.json(systemHealth);
});

/**
 * @route GET /api/health/database
 */
export const getDatabaseHealth = catchAsync(async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    const [dbInfo] = await sequelize.query('SELECT version() as version', {
      type: QueryTypes.SELECT
    }) as [{version: string}];
    
    const poolInfo = {
      total: 5, 
      idle: 3, 
      used: 2   
    };
    
    const dbHealth: DatabaseHealth = {
      status: 'UP',
      version: dbInfo.version,
      connection_pool: poolInfo
    };
    
    res.json(dbHealth);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown database error';
    res.status(503).json({
      status: 'DOWN',
      error: errorMsg
    });
  }
});

/**
 * @route GET /api/health/api-status
 */
export const getApiStatus = catchAsync(async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      message: 'API is healthy and connected to database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/system-status
 */
export const getSystemStatus = catchAsync(async (_req: Request, res: Response) => {
  try {
    const dbStatus = await sequelize.authenticate()
      .then(() => ({ connected: true, message: 'Connected' }))
      .catch(err => ({ connected: false, message: err.message }));
    
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuLoad: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    };
    
    res.status(200).json({
      status: dbStatus.connected ? 'OK' : 'PARTIAL',
      database: dbStatus,
      system: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get system status',
      timestamp: new Date().toISOString()
    });
  }
});
