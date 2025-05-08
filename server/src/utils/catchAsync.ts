import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

const catchAsync = (fn: Function): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
