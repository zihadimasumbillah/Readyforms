import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

export const isAdmin: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (!req.user.isAdmin) {
      res.status(403).json({ message: 'Admin privileges required' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization error' });
    return;
  }
};
export const adminMiddleware = isAdmin;
