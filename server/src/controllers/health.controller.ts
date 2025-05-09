import { Request, Response } from 'express';
import { sequelize } from '../models';
import os from 'os';

export const healthController = {

  ping: (req: Request, res: Response) => {
    const origin = req.headers.origin || 'unknown';
    
    console.log(`Ping received from origin: ${origin}`);
    
    res.status(200).json({ 
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      origin: origin
    });
  },

  status: async (req: Request, res: Response) => {
    try {
      await sequelize.authenticate();
      const dbStatus = 'connected';
      
      res.status(200).json({
        status: 'ok',
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          hostname: os.hostname()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },


  corsCheck: (req: Request, res: Response) => {
    const origin = req.headers.origin || 'unknown';
    const referer = req.headers.referer || 'unknown';
    
    res.status(200).json({
      corsStatus: 'enabled',
      message: 'CORS check successful',
      receivedHeaders: {
        origin,
        referer,
        host: req.headers.host,
        userAgent: req.headers['user-agent']
      },
      sentHeaders: {
        'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin') || 'not set',
        'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods') || 'not set',
        'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers') || 'not set',
        'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials') || 'not set'
      },
      timestamp: new Date().toISOString()
    });
  },
  
  // Debug endpoint for diagnosing issues, especially in production
  debug: (req: Request, res: Response) => {
    // Remove the async wrapper and handle Promises inside
    (async () => {
      try {
        // Basic security - only available in non-production or with debug token
        if (process.env.NODE_ENV === 'production' && req.query.debug_token !== process.env.DEBUG_TOKEN) {
          return res.status(403).json({
            status: 'forbidden',
            message: 'Debug endpoints are not available in production without valid debug token'
          });
        }
        
        // Get environment info
        const envInfo = {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL ? '***exists***' : undefined,
          CLIENT_URL: process.env.CLIENT_URL,
          isVercel: !!process.env.VERCEL,
          VERCEL_ENV: process.env.VERCEL_ENV,
          VERCEL_REGION: process.env.VERCEL_REGION,
          ALLOW_ALL_ORIGINS: process.env.ALLOW_ALL_ORIGINS
        };
        
        // Test database connection
        let dbConnectionResult;
        try {
          await sequelize.authenticate();
          dbConnectionResult = 'OK - Connection established';
        } catch (err: any) {
          dbConnectionResult = `FAILED - ${err.message}`;
        }
        
        res.status(200).json({
          status: 'ok',
          environment: envInfo,
          database: {
            connectionStatus: dbConnectionResult,
            dialect: sequelize.getDialect(),
            host: sequelize.config.host || 'Using connection string'
          },
          serverInfo: {
            hostname: os.hostname(),
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            uptime: process.uptime()
          },
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        res.status(500).json({
          status: 'error',
          message: error.message || 'Unknown error checking server health'
        });
      }
    })(); // Self-executing async function
  }
};
