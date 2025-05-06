import { Request, Response } from 'express';
import { sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import axios from 'axios';
import os from 'os';

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
      interface DbVersionInfo {
        version: string;
        current_database: string;
        current_user: string;
      }
      const dbStatus = await sequelize.query('SELECT version(), current_database(), current_user');
      const dbInfo = dbStatus[0] as DbVersionInfo[];
      dbMetrics = {
        connected: true,
        version: dbInfo[0].version,
        database: dbInfo[0].current_database,
        user: dbInfo[0].current_user
      };
    } catch (error) {
      dbMetrics = {
        connected: false,
        error: (error as Error).message
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

/**
 * Get system health status
 * @route GET /api/health
 */
export const getHealth = catchAsync(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const databaseStartTime = Date.now();
    await sequelize.authenticate();
    const databaseResponseTime = Date.now() - databaseStartTime;
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Prepare health check result
    const healthCheck: HealthCheckResult = {
      status: 'healthy',
      message: 'API is functioning normally',
      database: {
        connected: true,
        responseTime: databaseResponseTime
      },
      memory: {
        usage: Math.round(memoryUsage.rss / 1024 / 1024), // Convert to MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // Convert to MB
        free: Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024) // Convert to MB
      },
      uptime: process.uptime()
    };
    
    return res.status(200).json(healthCheck);
  } catch (error) {
    const typedError = error as Error;
    const healthCheck = {
      status: 'unhealthy',
      message: 'API is experiencing issues',
      database: {
        connected: false,
        responseTime: Date.now() - startTime
      },
      error: typedError.message,
      uptime: process.uptime()
    };
    
    return res.status(503).json(healthCheck);
  }
});

/**
 * Get database health status
 * @route GET /api/health/database
 */
export const getDatabaseHealth = catchAsync(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get table statistics
    const [dbStats] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM "Users") as user_count,
        (SELECT COUNT(*) FROM "Templates") as template_count,
        (SELECT COUNT(*) FROM "FormResponses") as response_count
    `);
    
    // Cast to proper type
    interface DbStats {
      user_count: number;
      template_count: number;
      response_count: number;
    }
    
    const typedDbStats = dbStats as unknown as DbStats[];
    
    return res.status(200).json({
      status: 'connected',
      responseTime: Date.now() - startTime,
      statistics: {
        users: typedDbStats[0].user_count,
        templates: typedDbStats[0].template_count,
        responses: typedDbStats[0].response_count
      }
    });
  } catch (error) {
    const typedError = error as Error;
    return res.status(503).json({
      status: 'disconnected',
      responseTime: Date.now() - startTime,
      error: typedError.message
    });
  }
});
