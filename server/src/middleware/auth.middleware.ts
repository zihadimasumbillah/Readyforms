import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import jwtConfig from '../config/jwt.config';
import { RequestHandler } from 'express-serve-static-core';
import { validate as isUuid } from 'uuid';

interface DecodedToken {
  id: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken: RequestHandler = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ message: 'Authentication token is missing' });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as DecodedToken;
      
      if (typeof decoded !== 'object' || !decoded.id) {
        res.status(401).json({ message: 'Invalid token structure' });
        return;
      }

      if (!isUuid(decoded.id)) {
        res.status(401).json({ message: 'Invalid user ID in token' });
        return;
      }

      try {
        console.log(`Looking up user with ID: ${decoded.id}`);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
          console.error(`User with ID ${decoded.id} not found in database`);
          res.status(401).json({ message: 'User not found or has been deleted' });
          return;
        }

        if (user.blocked) {
          res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
          return;
        }

        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          language: user.language,
          theme: user.theme
        };
        
        next();
      } catch (dbError) {
        console.error('Database error in auth middleware:', dbError);
        res.status(500).json({ message: 'Database error during authentication' });
        return;
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }
      
      console.error('Token verification error:', error);
      res.status(403).json({ message: 'Authentication failed' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
    return;
  }
};

export const authMiddleware = authenticateToken;
