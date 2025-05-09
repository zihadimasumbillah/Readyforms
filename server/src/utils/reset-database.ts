import { sequelize } from '../models';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Reset the database by dropping all tables and recreating them
 * This is useful for development and testing environments
 */
async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Safety check to prevent accidental reset in production
    if (process.env.NODE_ENV === 'production') {
      console.error('ERROR: Database reset is not allowed in production environment.');
      process.exit(1);
    }

    console.log('Dropping all tables...');
    await sequelize.drop({ cascade: true });
    console.log('All tables dropped successfully.');

    console.log('Recreating database schema...');
    await sequelize.sync({ force: true });
    console.log('Database schema recreated successfully.');

    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset function if this script is executed directly
if (require.main === module) {
  resetDatabase();
}

export default resetDatabase;
