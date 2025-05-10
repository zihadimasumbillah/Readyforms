import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

/**
 * Global error handling middleware for Express
 */
export const errorMiddleware: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error caught by global error handler:', err);
  
  // Handle CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    res.status(403).json({
      message: 'CORS Error',
      error: err.message,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Check if this is a database connection error
  const isDbConnectionError = err.name === 'SequelizeConnectionError' || 
                             err.name === 'SequelizeConnectionRefusedError' ||
                             (err.original && err.original.code === 'ECONNREFUSED') ||
                             (err.message && err.message.includes('pg package'));
  
  if (isDbConnectionError) {
    console.error('Database connection error detected in error handler');
    res.status(500).json({ 
      message: 'Database connection error',
      error: 'Unable to connect to the database. Please try again later.',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    timestamp: new Date().toISOString() 
  });
};

// Default export for backwards compatibility
export default errorMiddleware;
