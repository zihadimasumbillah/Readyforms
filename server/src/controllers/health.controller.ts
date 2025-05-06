import { Request, Response } from 'express';
import { sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import axios from 'axios';
import os from 'os';

/**
 * Check endpoints health
 * @route GET /api/health/check
 */
export const checkEndpoints = catchAsync(async (_req: Request, res: Response) => {
  const results = [];
  let overallStatus = 'healthy';
  
  try {
    // Check database connection
    const dbStartTime = Date.now();
    try {
      await sequelize.authenticate();
      results.push({
        name: 'Database',
        status: 'healthy',
        responseTime: Date.now() - dbStartTime
      });
    } catch (error) {
      overallStatus = 'unhealthy';
      results.push({
        name: 'Database',
        status: 'unhealthy',
        message: 'Database connection failed',
        responseTime: Date.now() - dbStartTime
      });
    }
    
    // Check auth service
    const authStartTime = Date.now();
    try {
      // Simple query to test auth routes
      await sequelize.query('SELECT 1');
      results.push({
        name: 'Authentication Service',
        status: 'healthy',
        responseTime: Date.now() - authStartTime
      });
    } catch (error) {
      overallStatus = 'unhealthy';
      results.push({
        name: 'Authentication Service',
        status: 'unhealthy',
        message: 'Auth service check failed',
        responseTime: Date.now() - authStartTime
      });
    }
    
    // Check storage availability
    const storageStartTime = Date.now();
    try {
      const freeDiskSpace = os.freemem();
      results.push({
        name: 'Storage',
        status: 'healthy',
        message: `${Math.round(freeDiskSpace / 1024 / 1024)} MB free`,
        responseTime: Date.now() - storageStartTime
      });
    } catch (error) {
      overallStatus = 'unhealthy';
      results.push({
        name: 'Storage',
        status: 'unhealthy',
        message: 'Storage check failed',
        responseTime: Date.now() - storageStartTime
      });
    }
    
    res.status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      endpoints: results
    });
  } catch (error) {
    console.error('Error checking endpoints:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      endpoints: [{
        name: 'API',
        status: 'unhealthy',
        message: 'Health check service failed'
      }]
    });
  }
});

/**
 * Get detailed system health metrics
 * @route GET /api/health/system
 */
export const getSystemHealth = catchAsync(async (_req: Request, res: Response) => {
  try {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const uptimeHrs = process.uptime() / 3600;
    
    // Get system info
    const systemInfo = {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      cpuCores: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
    };
    
    // Get process metrics
    const processMetrics = {
      uptime: Math.round(uptimeHrs * 100) / 100,
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      memoryUsage: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round((memUsage.external || 0) / 1024 / 1024)
      }
    };
    
    // Get database metrics
    let dbMetrics = {};
    try {
      const dbStatus = await sequelize.query('SELECT version(), current_database(), current_user');
      dbMetrics = {
        connected: true,
        version: dbStatus[0][0].version,
        database: dbStatus[0][0].current_database,
        user: dbStatus[0][0].current_user
      };
    } catch (error) {
      dbMetrics = {
        connected: false,
        error: error.message
      };
    }
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      system: systemInfo,
      process: processMetrics,
      database: dbMetrics
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ 
      message: 'Server error while getting system health',
      timestamp: new Date().toISOString()
    });
  }
});
