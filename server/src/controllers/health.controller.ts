import { Request, Response } from 'express';
import { sequelize } from '../models';

/**
 * Health check endpoint
 */
export const healthCheck = async (req: Request, res: Response) => {
  // Add permissive CORS headers for this specific health route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'ok',
      message: 'API server is healthy',
      timestamp: new Date().toISOString(),
      components: {
        database: 'connected',
        api: 'running'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      message: 'API health check failed',
      timestamp: new Date().toISOString(),
      components: {
        database: 'disconnected',
        api: 'running'
      },
      error: process.env.NODE_ENV === 'production' ? 'Database connection error' : (error as Error).message
    });
  }
};

/**
 * Simple ping endpoint for connectivity testing
 */
export const ping = (req: Request, res: Response) => {
  // Add permissive CORS headers for this specific ping route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin',
    requestHeaders: {
      host: req.headers.host,
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']
    }
  });
};

/**
 * CORS testing endpoint
 */
export const corsTest = (req: Request, res: Response) => {
  // Add permissive CORS headers for this specific CORS test route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.status(200).json({
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin',
    corsHeaders: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  });
};
