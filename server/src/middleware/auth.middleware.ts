import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { JWT_SECRET } from '../config/jwt.config';

// Extend Express Request with user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }
  
  try {
    // Verify token using the consistent JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user exists
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ message: 'User is blocked, access denied' });
    }
    
    // Add user to request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});
