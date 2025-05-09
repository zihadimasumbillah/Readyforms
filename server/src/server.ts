import app from './app';
import dotenv from 'dotenv';
import { sequelize } from './models';

// Load environment variables
dotenv.config();

// Use environment port or default to 3001
const PORT = process.env.PORT || 3001;

// Determine if running in serverless environment or jest test
const isServerlessEnv = process.env.VERCEL === '1' || 
                       process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined ||
                       process.env.NETLIFY !== undefined;
                       
const isTestEnv = process.env.NODE_ENV === 'test';

// Only start the server if not in a serverless environment or test
if (!isServerlessEnv && !isTestEnv) {
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

// Export the Express app for serverless environments and testing
export default app;
module.exports = app;
