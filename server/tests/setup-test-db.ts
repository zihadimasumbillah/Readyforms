import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set environment as test to prevent auto-initialization
process.env.NODE_ENV = 'test';

async function setupTestDb() {
  console.log('Setting up test database...');

  // Clear any cached models to avoid initialization conflicts
  Object.keys(require.cache).forEach(key => {
    if (key.includes('/models/') && !key.includes('node_modules')) {
      console.log(`Clearing cached model: ${key}`);
      delete require.cache[key];
    }
  });

  const host = process.env.DB_HOST || 'localhost';
  const username = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const testDbName = process.env.TEST_DB_NAME || 'readyforms_test';
  const port = parseInt(process.env.DB_PORT || '5432');
  
  console.log(`Connecting to PostgreSQL at ${host}:${port} to create test database: ${testDbName}`);
  
  // Create connection to default 'postgres' database first
  const sequelize = new Sequelize('postgres', username, password, {
    host,
    port,
    dialect: 'postgres',
    logging: false
  });
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL server');
    
    // Try to create the test database if it doesn't exist
    try {
      console.log(`Creating database ${testDbName} if it doesn't exist...`);
      
      // Use raw SQL query to check if database exists
      const [results] = await sequelize.query(
        `SELECT 1 FROM pg_database WHERE datname = '${testDbName}'`
      );
      
      if (Array.isArray(results) && results.length === 0) {
        // Database doesn't exist, create it
        console.log(`Database '${testDbName}' doesn't exist. Creating it now...`);
        await sequelize.query(`CREATE DATABASE ${testDbName};`);
        console.log(`Database '${testDbName}' created successfully`);
      } else {
        console.log(`Database '${testDbName}' already exists`);
      }
      
    } catch (error: unknown) {
      // Handle case where database already exists
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('already exists')) {
        console.log(`Database '${testDbName}' already exists`);
      } else {
        console.error('Error while creating database:', error);
        return false;
      }
    }
    
    // Close the connection to postgres database
    await sequelize.close();
    console.log('Closed connection to PostgreSQL server');
    
    // Done with test database creation
    console.log('Test database setup complete');
    
    // Return true to indicate successful setup
    return true;
  } catch (error: unknown) {
    console.error('Error setting up test database:', error);
    return false;
  }
}

export default setupTestDb;
