import { sequelize, User, Template, FormResponse, Like, Comment, Topic, Tag } from '../models';
import dotenv from 'dotenv';
import { Model, ModelStatic, QueryTypes } from 'sequelize';

dotenv.config();

async function runDebugScan() {
  try {
    console.log('===== Running Database Debug Scan =====');
    console.log('Database connection:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual parameters');
    
    // Test database connection
    try {
      await sequelize.authenticate();
      console.log('✓ Database connection successful');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      process.exit(1);
    }
    
    // Check tables exist with record counts
    console.log('\nChecking tables and record counts:');
    // Fix the model type by using 'any' to bypass type checking
    const tables: Array<{ model: any, name: string }> = [
      { model: User, name: 'Users' },
      { model: Template, name: 'Templates' },
      { model: FormResponse, name: 'Form Responses' },
      { model: Like, name: 'Likes' },
      { model: Comment, name: 'Comments' },
      { model: Topic, name: 'Topics' },
      { model: Tag, name: 'Tags' }
    ];
    
    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`✓ ${table.name}: ${count} records`);
        
        // Additional check for test users in User table
        // Use type assertion to avoid strict comparison issue
        if (table.model === User && count > 0) {
          const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
          const regularUser = await User.findOne({ where: { email: 'user@example.com' } });
          
          console.log(`  - admin@example.com: ${adminUser ? 'exists' : 'missing'}`);
          console.log(`  - user@example.com: ${regularUser ? 'exists' : 'missing'}`);
        }
      } catch (error) {
        console.error(`✗ Error checking ${table.name}:`, error);
      }
    }
    
    console.log('\nDatabase schema analysis:');
    try {
      // Get all table names
      const result = await sequelize.query(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'",
        { type: QueryTypes.SELECT }
      );
      
      const tableNames = result.map((row: any) => row.tablename);
      console.log('Tables in database:', tableNames);
      
    } catch (error) {
      console.error('Error analyzing database schema:', error);
    }
    
    console.log('\n===== Debug Scan Complete =====');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during debug scan:', error);
    process.exit(1);
  }
}

// Run scan if executed directly
if (require.main === module) {
  runDebugScan();
}

export default runDebugScan;
