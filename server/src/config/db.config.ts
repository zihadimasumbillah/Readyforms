import { SequelizeOptions } from 'sequelize-typescript';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection using CONNECTION_URL when available
const connectionUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

// Configure SSL options based on environment
const sslOptions = isProduction ? {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
} : {};

const loggingOption = process.env.NODE_ENV === 'development' ? console.log : false;

let config: SequelizeOptions;

if (connectionUrl) {
  // Use connection URL if available
  config = {
    dialect: 'postgres',
    dialectOptions: sslOptions,
    logging: loggingOption
  };
  
  // Add the connection URL (can't use url property directly with TypeScript)
  (config as any).url = connectionUrl;
} else {
  // Fall back to individual connection parameters
  config = {
    database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'readyforms',
    username: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: sslOptions,
    logging: loggingOption
  };
}

export default config;