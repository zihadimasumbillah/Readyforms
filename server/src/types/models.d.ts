import { Model, ModelStatic } from 'sequelize';
import { Sequelize } from 'sequelize';

// Extend the ModelStatic interface to include associate and initialize methods
declare module 'sequelize' {
  interface ModelStatic<M extends Model> {
    associate?: (models: Record<string, ModelStatic<any>>) => void;
    initialize?: (sequelize: Sequelize) => void;
  }
}

// Extend the Template model to include tags
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
