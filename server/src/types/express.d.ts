import { User } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestId?: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    requestId?: string;
  }
}

export {};