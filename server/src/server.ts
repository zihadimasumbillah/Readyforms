import express, { Express } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { populateDefaults } from './utils/ensure-test-users';
import sequelize from './config/database';

dotenv.config();

const app: Express = require('./app');
const PORT: number = parseInt(process.env.PORT || '3000');

// Interface for route tracking
interface Route {
  path: string;
  methods: string[];
}

const startServer = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized successfully.');
    
    // In development or test, ensure test users exist
    if (process.env.NODE_ENV !== 'production' || process.env.POPULATE_TEST_USERS === 'true') {
      await populateDefaults();
    }
    
    // Create an HTTP server
    const server = http.createServer(app);
    
    // Log all available routes if in development
    if (process.env.NODE_ENV === 'development') {
      const routes: Route[] = []; // Use the Route interface for type safety
      
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          // Routes registered directly
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods)
          });
        } else if (middleware.name === 'router') {
          // Routes added with router.use
          middleware.handle.stack.forEach((handler: any) => {
            if (handler.route) {
              const path = handler.route.path;
              routes.push({
                path: middleware.regexp.toString().includes('/api') ? `/api${path}` : path,
                methods: Object.keys(handler.route.methods)
              });
            }
          });
        }
      });
      
      console.log('\nAPI Routes:');
      console.log('===========');
      routes.forEach(route => {
        console.log(`${route.methods.join(', ').toUpperCase()} ${route.path}`);
      });
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual parameters'}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
          console.log('Database connections closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

// If this is running in a serverless environment, export the app for Vercel
if (process.env.VERCEL) {
  module.exports = app;
}

export default app;
