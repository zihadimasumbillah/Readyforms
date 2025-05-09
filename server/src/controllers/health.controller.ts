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
  }
};
