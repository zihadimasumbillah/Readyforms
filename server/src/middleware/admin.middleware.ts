import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';

export const adminMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists and is admin
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
});
