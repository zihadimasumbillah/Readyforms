import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isCloudEnv = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

const DATABASE_URL = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    },
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      // Global model options
      timestamps: true, // Add createdAt and updatedAt
      underscored: false, // Use camelCase column names
      freezeTableName: false, // Use pluralized table names
      version: true // Support optimistic locking
    }
  });
} else {
  if (isCloudEnv) {
    console.warn('Warning: Running in cloud environment without DATABASE_URL. Connection will likely fail.');
  }

  sequelize = new Sequelize(
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
      },
      define: {
        // Global model options
        timestamps: true,
        underscored: false,
        freezeTableName: false,
        version: true
      }
    }
  );
}

export default sequelize;
