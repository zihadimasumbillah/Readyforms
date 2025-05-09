import express from 'express';
import { User, Template, Topic, Tag } from '../models';
import bcrypt from 'bcryptjs';

const router = express.Router();

if (process.env.NODE_ENV === 'production') {
  router.all('*', (_req, res) => {
    res.status(404).send('Debug routes not available in production');
  });
} else {

  router.post('/ensure-test-users', async (req, res) => {
    try {
      console.log('Debug: Ensuring test users exist');
      const results = {
        admin: false,
        user: false,
        errors: [] as string[]
      };
      
      try {
        const adminEmail = 'admin@example.com';
        let admin = await User.findOne({ where: { email: adminEmail } });
        
        if (!admin) {
          console.log('Creating admin user');
          const hashedAdminPassword = await bcrypt.hash('admin123', 10);
          admin = await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedAdminPassword,
            isAdmin: true,
            language: 'en',
            theme: 'light',
            blocked: false, 
            lastLoginAt: new Date()
          });
          results.admin = true;
        } else {
          console.log('Admin user already exists');
          results.admin = true;
        }
      } catch (error) {
        console.error('Error ensuring admin user:', error);
        results.errors.push(`Admin user error: ${(error as Error).message}`);
      }
      
      try {
        const userEmail = 'user@example.com';
        let regularUser = await User.findOne({ where: { email: userEmail } });
        
        if (!regularUser) {
          console.log('Creating regular user');
          const hashedUserPassword = await bcrypt.hash('user123', 10);
          regularUser = await User.create({
            name: 'Regular User',
            email: userEmail,
            password: hashedUserPassword,
            isAdmin: false,
            language: 'en',
            theme: 'light',
            blocked: false, 
            lastLoginAt: new Date()
          });
          results.user = true;
        } else {
          console.log('Regular user already exists');
          results.user = true;
        }
      } catch (error) {
        console.error('Error ensuring regular user:', error);
        results.errors.push(`Regular user error: ${(error as Error).message}`);
      }
      try {
        const topicsCount = await Topic.count();
        if (topicsCount === 0) {
          console.log('Creating default topic');
          await Topic.create({
            name: 'General',
            description: 'General topic for forms'
          });
        }
      } catch (error) {
        console.error('Error ensuring topic exists:', error);
        results.errors.push(`Topic error: ${(error as Error).message}`);
      }
      
      res.status(200).json({
        message: 'Test users setup completed',
        results
      });
    } catch (error) {
      console.error('Error ensuring test users:', error);
      res.status(500).json({ 
        message: 'Error ensuring test users',
        error: (error as Error).message 
      });
    }
  });
  
  router.get('/info', async (_req, res) => {
    try {
      const userCount = await User.count();
      const templateCount = await Template.count();
      const topicCount = await Topic.count();
      const tagCount = await Tag.count();
      
      res.status(200).json({
        environment: process.env.NODE_ENV || 'development',
        counts: {
          users: userCount,
          templates: templateCount,
          topics: topicCount,
          tags: tagCount
        }
      });
    } catch (error) {
      console.error('Error getting debug info:', error);
      res.status(500).json({ 
        message: 'Error getting debug info',
        error: (error as Error).message 
      });
    }
  });
}

export default router;
