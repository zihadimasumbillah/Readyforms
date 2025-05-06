import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.config';

/**
 * User registration
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the model hook
      language: 'en', // Default language
      theme: 'light' // Default theme
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
    
    // Return user data and token without the password
    const userData = user.toJSON();
    delete userData.password;
    
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * User login
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    
    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
    
    // Return user data and token without the password
    const userData = user.toJSON();
    delete userData.password;
    
    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Get current user info
 * @route GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // User is already attached to the request by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Return user data without the password
    const userData = req.user.toJSON();
    delete userData.password;
    
    return res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user preferences
 * @route PUT /api/auth/preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { language, theme } = req.body;
    
    // Update user preferences
    await req.user.update({
      language: language || req.user.language,
      theme: theme || req.user.theme
    });
    
    return res.status(200).json({
      message: 'Preferences updated successfully',
      user: {
        language: req.user.language,
        theme: req.user.theme
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/current-user
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(200).json(user);
});