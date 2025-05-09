import dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

let config: {
  host: string;
  username: string;
  password: string;
  database: string;
  dialect: 'postgres';
  port: number;
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean | ((sql: string, timing?: number) => void);
};

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL) {
  console.log('Using DATABASE_URL for connection in db.config');
  
  try {
    const parsed = parse(DATABASE_URL);
    config = {
      host: parsed.host || 'localhost',
      username: parsed.user || 'postgres',
      password: parsed.password || 'postgres',
      database: parsed.database || 'readyforms',
      dialect: 'postgres',
      port: parsed.port ? parseInt(parsed.port) : 5432,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false 
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
    
    console.log('Database config initialized with parsed connection string');
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);

    config = {
      host: 'localhost', 
      username: 'postgres',
      password: 'postgres',
      database: 'readyforms',
      dialect: 'postgres',
      port: 5432,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    };
  }
} else {
   
  config = {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'readyforms',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  };
  
  console.log('Database config initialized with individual parameters');
}

export default config;