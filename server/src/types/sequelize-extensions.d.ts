import { Model, ModelStatic } from 'sequelize';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'sequelize' {
  interface ModelStatic<M extends Model> {
    associate?: (models: Record<string, any>) => void;
  }
}

export {};
