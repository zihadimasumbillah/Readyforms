import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error caught by global error handler:', err);
  
  // Handle CORS error
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({
      message: 'CORS Error',
      error: err.message,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check if this is a database connection error
  const isDbConnectionError = err.name === 'SequelizeConnectionError' || 
                             err.name === 'SequelizeConnectionRefusedError' ||
                             (err.original && err.original.code === 'ECONNREFUSED');
  
  if (isDbConnectionError) {
    console.error('Database connection error detected in error handler');
    return res.status(500).json({ 
      message: 'Database connection error',
      error: 'Unable to connect to the database. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle other types of errors
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message,
    timestamp: new Date().toISOString() 
  });
};
