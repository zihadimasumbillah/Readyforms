import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'readyforms',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Add QueryTypes to Sequelize type
declare module 'sequelize' {
  interface Sequelize {
    QueryTypes: {
      SELECT: 'SELECT';
      INSERT: 'INSERT';
      UPDATE: 'UPDATE';
      DELETE: 'DELETE';
      UPSERT: 'UPSERT';
      BULKUPDATE: 'BULKUPDATE';
      BULKDELETE: 'BULKDELETE';
    };
  }
}

// Define QueryTypes property
sequelize.QueryTypes = {
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  UPSERT: 'UPSERT',
  BULKUPDATE: 'BULKUPDATE',
  BULKDELETE: 'BULKDELETE'
};

export default sequelize;
