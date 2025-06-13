import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: '.env.test' });

// Create a dedicated Sequelize instance for tests
const testSequelize = new Sequelize(
  process.env.TEST_DB_NAME || 'readyforms_test',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.TEST_LOGS === 'true' ? console.log : false,
    define: {
      timestamps: true,
      version: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default testSequelize;
