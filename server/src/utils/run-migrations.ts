import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import sequelize from '../config/database';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'));
      
    migrationFiles.sort();
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM migrations'
    );
    const executedMigrationNames = executedMigrations.map((m: any) => m.name);
    
    for (const file of migrationFiles) {
      if (executedMigrationNames.includes(file)) {
        console.log(`Migration ${file} already executed, skipping...`);
        continue;
      }
      
      console.log(`Running migration: ${file}...`);
      const migration = require(path.join(migrationsDir, file));
      
      if (typeof migration.up === 'function') {
        await migration.up(sequelize.getQueryInterface(), Sequelize);

        await sequelize.query(
          'INSERT INTO migrations (name) VALUES (?)',
          {
            replacements: [file]
          }
        );
        
        console.log(`Migration ${file} completed successfully.`);
      } else {
        console.warn(`Migration ${file} has no 'up' function, skipping...`);
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });