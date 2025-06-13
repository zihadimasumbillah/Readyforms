import { sequelize } from '../models';
import { QueryTypes } from 'sequelize';

/**
 * This utility function adds missing columns to the database tables
 * It's particularly useful for adding the 'blocked' column to the users table
 */
async function addMissingColumns() {
  try {
    console.log('Starting to add missing columns...');

    // Check if 'blocked' column exists in users table
    const usersColumns = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'",
      { type: QueryTypes.SELECT }
    );

    const columnNames = usersColumns.map((col: any) => col.column_name);
    
    // Add 'blocked' column if it doesn't exist
    if (!columnNames.includes('blocked')) {
      console.log("Adding 'blocked' column to users table...");
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false"
      );
      console.log("Added 'blocked' column to users table.");
    } else {
      console.log("'blocked' column already exists in users table.");
    }

    // Check if 'lastLoginAt' column exists in users table
    if (!columnNames.includes('lastloginat')) {
      console.log("Adding 'lastLoginAt' column to users table...");
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS \"lastLoginAt\" TIMESTAMP"
      );
      console.log("Added 'lastLoginAt' column to users table.");
    } else {
      console.log("'lastLoginAt' column already exists in users table.");
    }

    // Check if 'version' column exists
    if (!columnNames.includes('version')) {
      console.log("Adding 'version' column to users table...");
      await sequelize.query(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0"
      );
      console.log("Added 'version' column to users table.");
    } else {
      console.log("'version' column already exists in users table.");
    }

    console.log('All missing columns have been added successfully.');
    
    if (require.main === module) {
      process.exit(0);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding missing columns:', error);
    
    if (require.main === module) {
      process.exit(1);
    }
    
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  addMissingColumns();
}

export default addMissingColumns;
