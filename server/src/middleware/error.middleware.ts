import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error caught by global error handler:', err);

  if (err.message && err.message.includes('Not allowed by CORS')) {
    res.status(403).json({
      message: 'Access denied',
      time: new Date().toISOString()
      // SECURITY: Do NOT echo req.headers.origin — it is attacker-controlled
      // and leaks information about CORS configuration
    });
    return;
  }

  // Handle database connection errors
  if (
    err.name === 'SequelizeConnectionError' ||
    err.name === 'SequelizeConnectionRefusedError' ||
    (err.original && err.original.code === 'ECONNREFUSED')
  ) {
    res.status(503).json({
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Service temporarily unavailable',
      time: new Date().toISOString()
    });
    return;
  }

  // Handle missing table errors
  if (err.name === 'SequelizeDatabaseError' && 
      err.parent && 
      err.parent.code === '42P01' && 
      err.parent.message && 
      err.parent.message.includes('relation') && 
      err.parent.message.includes('does not exist')) {
    
    // Extract the table name from the error message
    const tableNameMatch = err.parent.message.match(/relation "([^"]+)" does not exist/);
    const tableName = tableNameMatch ? tableNameMatch[1] : 'unknown';
    
    res.status(500).json({
      message: `Database schema error: Table "${tableName}" does not exist`,
      details: 'The application database schema is incomplete. Please run migrations or setup the database correctly.',
      time: new Date().toISOString()
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      errors: err.errors?.map(e => ({ field: e.path, message: e.message })),
      time: new Date().toISOString()
    });
    return;
  }

  // Handle unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      message: 'Duplicate entry error',
      errors: err.errors?.map(e => ({ field: e.path, message: e.message })),
      time: new Date().toISOString()
    });
    return;
  }

  // Default error response — never expose error internals in production
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    requestId: (req as any).requestId,
    time: new Date().toISOString()
  });
};

export default errorHandler;
