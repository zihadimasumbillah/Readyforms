import { Model, ModelStatic } from 'sequelize';
import { Sequelize } from 'sequelize';

declare module 'sequelize' {
  interface ModelStatic<M extends Model> {
    associate?: (models: Record<string, ModelStatic<any>>) => void;
    initialize?: (sequelize: Sequelize) => void;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
