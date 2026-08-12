import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Properly detect cloud environment
const isCloudEnv = process.env.VERCEL === '1' || 
                  !!process.env.AWS_LAMBDA_FUNCTION_VERSION || 
                  !!process.env.RAILWAY_PROJECT_ID ||
                  !!process.env.RENDER_SERVICE_ID;
                  
const isProd = process.env.NODE_ENV === 'production';

// Get database connection parameters
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const DIRECT_URL = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING;
const USE_DIRECT_URL = Boolean(process.env.USE_DIRECT_URL === 'true' || process.env.USE_DIRECT_CONNECTION === 'true');

const connectionUrl = USE_DIRECT_URL && DIRECT_URL ? DIRECT_URL : DATABASE_URL;

// Function to create a placeholder Sequelize instance for error cases
function createPlaceholderSequelize(errorMessage: string): Sequelize {
  const placeholder = new Sequelize('', '', '', {
    dialect: 'postgres',
    logging: false,
  });
  
  // Override the authenticate method to always throw the specified error
  placeholder.authenticate = async (): Promise<void> => {
    throw new Error(errorMessage);
  };
  
  return placeholder;
}

// Create Sequelize instance - initialize with a placeholder
let sequelize: Sequelize = createPlaceholderSequelize('Database connection not initialized');

let pgAvailable = false;
try {
  require('pg');
  pgAvailable = true;
} catch (err) {
  const error = err as Error;
  console.error('[DB] PostgreSQL driver (pg) not available:', error.message);
  sequelize = createPlaceholderSequelize('Database connection not initialized - pg package missing');
}

// Only proceed with real connection if pg is available
if (pgAvailable) {
  try {
    // Configure Sequelize with connection URL
    const needsSsl = connectionUrl ? (connectionUrl.includes('neon.tech') || connectionUrl.includes('sslmode=require')) : false;
    if (connectionUrl) {
      sequelize = new Sequelize(connectionUrl, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: needsSsl ? {
            require: true,
            // Verify the TLS certificate in production.
            // rejectUnauthorized:false disables cert verification and allows MITM attacks.
            rejectUnauthorized: isProd,
          } : false,
          keepAlive: true,
          connectTimeout: 30000,
          idle_in_transaction_session_timeout: 30000
        },
        logging: process.env.NODE_ENV === 'development',
        pool: {
          max: isProd ? 10 : 5,
          min: 0,
          acquire: 30000, // Reduced from 60 to 30 seconds
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: false,
          version: true
        }
      });
    } else {
      // Fall back to individual parameters
      const host = process.env.PGHOST || process.env.DB_HOST || 'localhost';
      const database = process.env.PGDATABASE || process.env.DB_NAME || 'readyforms';
      const username = process.env.PGUSER || process.env.DB_USER || 'postgres';
      const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres';
      const port = process.env.PGPORT ? parseInt(process.env.PGPORT) : (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432);
      
      sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect: 'postgres',
        dialectOptions: {
          ssl: host.includes('.neon.tech') ? {
            require: true,
            // Verify cert in production; allow self-signed in dev
            rejectUnauthorized: isProd,
          } : undefined,
          keepAlive: true
        },
        logging: process.env.NODE_ENV === 'development',
        pool: {
          max: isProd ? 10 : 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: false,
          version: true
        }
      });
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error initializing Sequelize instance:', error);
    // Keep the placeholder instance that was already initialized
    sequelize = createPlaceholderSequelize(`Database connection failed: ${error.message}`);
  }
}

// This is the only default export
export default sequelize;
