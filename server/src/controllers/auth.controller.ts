import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import jwtConfig from '../config/jwt.config';
import catchAsync from '../utils/catchAsync';
import { Op } from 'sequelize';

/**
 * @route POST /api/auth/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  try {
    const { name, email, password, language = 'en', theme = 'light', isAdmin = false } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ 
      where: { 
        email: { [Op.iLike]: email.toLowerCase().trim() } 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminPrivilege = isAdmin && (
      req.user?.isAdmin === true || 
      process.env.NODE_ENV === 'development' || 
      process.env.ALLOW_ADMIN_CREATION === 'true'
    );

    const user = await User.create({
      name,
      email: normalizedEmail, 
      password: hashedPassword,
      language,
      theme,
      isAdmin: adminPrivilege,
      blocked: false, 
      lastLoginAt: new Date() 
    });

    const savedUser = await User.findByPk(user.id);
    if (!savedUser) {
      console.error('User created but not found in subsequent query');
      return res.status(500).json({ message: 'User registration failed - database integrity issue' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: normalizedEmail, 
        isAdmin: user.isAdmin 
      }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log('User registered successfully:', user.id, normalizedEmail);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: normalizedEmail,
        isAdmin: user.isAdmin,
        language: user.language,
        theme: user.theme
      }
    });
  } catch (error: any) {
    console.error('Error in register:', error);
    return res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/auth/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Debug log to help with authentication issues
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ 
      where: { 
        email: { [Op.iLike]: email } 
      } 
    });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.blocked) {
      console.log(`Blocked user attempting login: ${email}`);
      return res.status(403).json({ message: 'Your account is blocked. Please contact administrator.' });
    }
    
    try {
      console.log(`Validating password for user: ${email}`);
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log(`Invalid password for user: ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(`Password validation error for ${email}:`, error);
      return res.status(500).json({ message: 'Error validating credentials' });
    }

    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin 
      }, 
      jwtConfig.secret, 
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(200).json({
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
  } catch (error: any) {
    console.error('Error in login:', error);
    return res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/auth/me
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme', 'createdAt', 'lastLoginAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in getCurrentUser:', error);
    return res.status(500).json({ 
      message: 'Server error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route PUT /api/auth/preferences
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { language, theme } = req.body;
    const updateData: any = {};

    if (language) updateData.language = language;
    if (theme) updateData.theme = theme;

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme']
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Preferences updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error in updatePreferences:', error);
    return res.status(500).json({ 
      message: 'Server error updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Handle forgot password request
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if email exists in the database
  // TODO: Implement actual email validation and password reset token generation

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
};

/**
 * Check authentication status
 */
export const checkAuth = async (req: Request, res: Response) => {
  // Simple endpoint to check if API auth routes are working
  res.status(200).json({
    success: true,
    message: 'Auth check endpoint is working'
  });
};
