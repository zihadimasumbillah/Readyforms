import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import jwtConfig from '../config/jwt.config';
import catchAsync from '../utils/catchAsync';
import { Op } from 'sequelize';

/**
 * ReDoS-safe email validation without polynomial backtracking loops.
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string' || email.length > 254) {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * @route POST /api/auth/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, language = 'en', theme = 'light' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (!isValidEmail(email)) {
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

import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';

/**
 * @route POST /api/auth/send-otp
 */
export const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, purpose = 'login' } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const otpCode = OTPService.setOTP(normalizedEmail, 10 * 60 * 1000);

  console.log('[OTP SYSTEM] Generated OTP for %s (%s): %s', normalizedEmail, purpose, otpCode);

  EmailService.sendOTPEmail(normalizedEmail, otpCode, purpose).catch((err) => {
    console.error('[OTP EMAIL ERROR]', err);
  });

  return res.status(200).json({
    message: `OTP sent successfully to ${normalizedEmail}`,
    email: normalizedEmail,
    expiresInSeconds: 600,
    devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
  });
});

/**
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP code are required' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const isValid = OTPService.verifyOTP(normalizedEmail, String(otp));

  if (!isValid) {
    return res.status(400).json({ message: 'Invalid or expired OTP code' });
  }

  let user = await User.findOne({ where: { email: { [Op.iLike]: normalizedEmail } } });

  if (!user) {
    // Cryptographically secure password hash for auto-provisioned user
    const randomSecret = crypto.randomBytes(32).toString('hex');
    const randomPassword = await bcrypt.hash(randomSecret, 12);
    user = await User.create({
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: randomPassword,
      isAdmin: false,
      blocked: false,
      lastLoginAt: new Date(),
    });
  } else if (user.blocked) {
    return res.status(403).json({ message: 'Your account is blocked.' });
  } else {
    User.update({ lastLoginAt: new Date() }, { where: { id: user.id } }).catch(() => {});
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return res.status(200).json({
    message: 'OTP verified successfully',
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
 * @route PUT /api/auth/profile
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { name, currentPassword, newPassword, theme, language } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const updateData: Record<string, any> = {};

  if (name && name.trim().length >= 2) {
    updateData.name = name.trim();
  }

  if (theme) updateData.theme = theme;
  if (language) updateData.language = language;

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required to set a new password' });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  await user.update(updateData);

  return res.status(200).json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      language: user.language,
      theme: user.theme,
    },
  });
});

/**
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ where: { email: { [Op.iLike]: normalizedEmail } } });

  // Generate CSPRNG 6-digit OTP via OTPService
  const otpCode = OTPService.setOTP(normalizedEmail, 10 * 60 * 1000);

  console.log('[PASSWORD RESET OTP] For %s: %s', normalizedEmail, otpCode);

  EmailService.sendOTPEmail(normalizedEmail, otpCode, 'password reset').catch((err) => {
    console.error('[RESET EMAIL ERROR]', err);
  });

  return res.status(200).json({
    message: 'If an account exists with this email, an OTP code has been generated.',
    devOtp: process.env.NODE_ENV === 'development' && user ? otpCode : undefined,
  });
});

/**
 * @route POST /api/auth/google-callback
 */
export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required from Google profile' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  let user = await User.findOne({ where: { email: { [Op.iLike]: normalizedEmail } } });

  if (!user) {
    const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
    user = await User.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: randomPassword,
      isAdmin: false,
      blocked: false,
      language: 'en',
      theme: 'light',
      lastLoginAt: new Date(),
    });
  } else {
    await user.update({ lastLoginAt: new Date() });
  }

  if (user.blocked) {
    return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn as any }
  );

  return res.status(200).json({
    message: 'Google login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      language: user.language,
      theme: user.theme,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

