import { Request, Response, NextFunction } from 'express';

const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ message: 'Admin privileges required' });
    return;
  }

  next();
};

export default adminMiddleware;
