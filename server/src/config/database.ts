import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isCloudEnv = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

// Debug database connection info
console.log('Database connection environment:', {
  isCloudEnv,
  hasDbUrl: !!DATABASE_URL,
  dbUrlFirstChars: DATABASE_URL ? DATABASE_URL.substring(0, 15) + '...' : 'not_provided',
  nodeEnv: process.env.NODE_ENV
});

let sequelize: Sequelize;

if (DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  
  // Configure Sequelize with DATABASE_URL
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
    console.error('ERROR: Running in cloud environment without DATABASE_URL. Connection will fail.');
    throw new Error('DATABASE_URL environment variable is required in Vercel or other cloud environments');
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
