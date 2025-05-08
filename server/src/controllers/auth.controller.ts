import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import jwtConfig from '../config/jwt.config';
import catchAsync from '../utils/catchAsync';
import sequelize from 'sequelize';
import { Op } from 'sequelize';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    [key: string]: any;
  };
}

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  blocked?: boolean;
  language: string;
  theme: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const generateToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, jwtConfig.secret, options);
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, language = 'en', theme = 'light' } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      language,
      theme
    });

    const token = generateToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        language: user.language,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error creating user account' });
  }
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log(`Login attempt for: ${email}`);
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email 
        }
      }
    });

    if (!user) {
      console.error(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password from request: ${password}`);
      console.log(`Password hash from DB: ${user.password.substring(0, 20)}...`);
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${isPasswordValid}`);
    } catch (error) {
      console.error('Error during password comparison:', error);
      return res.status(500).json({ message: 'Error verifying credentials' });
    }
    
    if (!isPasswordValid) {
      console.error(`Login failed: Invalid password for user ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.blocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
    }

    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      isAdmin: user.isAdmin 
    });

    console.log(`Login successful for user: ${user.email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        language: user.language || 'en',
        theme: user.theme || 'light'
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export const getCurrentUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    console.log(`Getting current user with ID: ${userId}`);
    
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme', 'createdAt', 'lastLoginAt'],
        raw: true 
      });
  
      if (!user) {
        console.log(`User not found for ID: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log(`Successfully found user: ${user.email}`);
      res.json(user);
    } catch (error) {
      const dbError = error as Error; 
      console.error(`Database error getting user ${userId}:`, dbError);
      res.status(500).json({ 
        message: 'Database error retrieving user profile',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
});

export const updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ name: name || user.name }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme']
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export const updatePreferences = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { language, theme } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ language, theme }, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme']
    });

    res.json({
      message: 'Preferences updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

export const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashedPassword }, { where: { id: userId } });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});
