import bcrypt from 'bcryptjs';
import { User } from '../models';

/**
 * Ensures that test/default users exist in the database
 * This is useful for development and testing environments
 */
export const populateDefaults = async (): Promise<void> => {
  try {
    console.log('Checking for default users...');
    
    // Check if admin user exists
    const adminExists = await User.findOne({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        blocked: false,
        language: 'en',
        theme: 'light',
        lastLoginAt: new Date()
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Default admin user already exists');
    }
    
    // Check if regular user exists
    const userExists = await User.findOne({
      where: { email: 'user@example.com' }
    });
    
    if (!userExists) {
      console.log('Creating default regular user...');
      const hashedPassword = await bcrypt.hash('user123', 10);
      await User.create({
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        isAdmin: false,
        blocked: false,
        language: 'en',
        theme: 'dark',
        lastLoginAt: new Date()
      });
      console.log('Regular user created successfully');
    } else {
      console.log('Default regular user already exists');
    }
    
    console.log('Default users check complete');
  } catch (error) {
    console.error('Error ensuring default users:', error);
  }
};

export default { populateDefaults };
