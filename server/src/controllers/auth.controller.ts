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
  const { name, email, password, language = 'en', theme = 'light' } = req.body;

  // ─── Input validation ───────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters long' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = name.trim();

  const existingUser = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // SECURITY: isAdmin is NEVER accepted from the request body during registration.
  // Admin role can only be granted by an existing admin via the /api/admin routes.
  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password: hashedPassword,
    language,
    theme,
    isAdmin: false,
    blocked: false,
    lastLoginAt: new Date(),
  });

  const token = jwt.sign(
    { id: user.id, email: normalizedEmail, isAdmin: false },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: normalizedEmail,
      isAdmin: false,
      language: user.language,
      theme: user.theme,
    },
  });
});

/**
 * @route POST /api/auth/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

  const user = await User.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  // Use a constant-time response to prevent email enumeration
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.blocked) {
    return res.status(403).json({ message: 'Your account is blocked. Please contact administrator.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Update last login asynchronously — fire and forget, non-blocking
  User.update({ lastLoginAt: new Date() }, { where: { id: user.id } }).catch(
    (err) => console.error('[AUTH] Failed to update lastLoginAt:', err.message)
  );

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
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
      theme: user.theme || 'light',
    },
  });
});

/**
 * @route GET /api/auth/me
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme', 'createdAt', 'lastLoginAt'],
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json(user);
});

/**
 * @route PUT /api/auth/preferences
 */
export const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const ALLOWED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'zh'];
  const ALLOWED_THEMES = ['light', 'dark', 'system'];

  const { language, theme } = req.body;
  const updateData: Record<string, string> = {};

  if (language) {
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: 'Invalid language value' });
    }
    updateData.language = language;
  }

  if (theme) {
    if (!ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme value' });
    }
    updateData.theme = theme;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No valid preference fields provided' });
  }

  await User.update(updateData, { where: { id: req.user.id } });

  const updatedUser = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email', 'isAdmin', 'language', 'theme'],
  });

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    message: 'Preferences updated successfully',
    user: updatedUser,
  });
});

/**
 * @route POST /api/auth/forgot-password
 * @todo Implement email-based password reset with a signed, time-limited token
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  // Return 404 rather than 501 to avoid confirming this endpoint exists to attackers
  res.status(404).json({ message: 'Not found' });
};
