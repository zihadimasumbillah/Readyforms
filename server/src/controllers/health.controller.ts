import { Request, Response } from 'express';
import { sequelize } from '../models';
import os from 'os';

export const healthCheck = async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database connection error:', error);
  }
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      serverTime: new Date().toISOString()
    }
  });
};

export const pingApi = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header'
  });
};

export const corsTest = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      host: req.headers.host
    }
  });
};
