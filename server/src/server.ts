import app from './app';
import dotenv from 'dotenv';
import { sequelize } from './models';

// Load environment variables
dotenv.config();

// Use environment port or default to 3001
const PORT = process.env.PORT || 3001;

// Determine if running in serverless environment
const isServerlessEnv = process.env.VERCEL === '1' || 
                       process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined ||
                       process.env.NETLIFY !== undefined;

// Only start the server when not in a serverless environment
if (!isServerlessEnv) {
  // Initialize database and then start the server
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
      });
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  };

  startServer();
}

// Export the Express app for serverless environments (Vercel)
export default app;
