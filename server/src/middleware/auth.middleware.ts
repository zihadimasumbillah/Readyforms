import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';
import { User } from '../models';

interface JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}


const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      if (user.blocked) {
        res.status(403).json({ message: 'Your account is blocked' });
        return;
      }
      
      req.user = user;
      
      next();
    } catch (error) {
      if ((error as Error).name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Token expired' });
        return;
      }
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
    return;
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        if (user && !user.blocked) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid or expired - ignore for optionalAuth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default verifyToken;
export { verifyToken };

export const authMiddleware = verifyToken;

