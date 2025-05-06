import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async controller function to properly catch and forward errors to Express
 * This ensures that Promise rejections are handled properly in route handlers
 */
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
