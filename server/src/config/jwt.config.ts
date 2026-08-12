import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// SECURITY: JWT_SECRET MUST be set via environment variable in production.
// A hardcoded fallback is deliberately NOT provided to prevent silent use of a weak secret.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) {
    // Crash-hard: running in production without a real secret is a critical security failure.
    throw new Error(
      '[FATAL] JWT_SECRET environment variable is not set. ' +
      'Set a strong, unique 256-bit secret in your Vercel environment variables.'
    );
  } else {
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is not set. Using an insecure development fallback. ' +
      'Never run without a real secret in production.'
    );
  }
}

const secret = jwtSecret || 'INSECURE_DEV_ONLY_FALLBACK_DO_NOT_USE_IN_PRODUCTION';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '24h';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (isProd ? undefined : 'INSECURE_REFRESH_DEV_FALLBACK');
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

if (isProd && !jwtRefreshSecret) {
  console.warn('[SECURITY WARNING] JWT_REFRESH_SECRET is not set in production.');
}

const jwtConfig = {
  secret,
  expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
  refreshSecret: jwtRefreshSecret || secret,
  refreshExpiresIn: jwtRefreshExpiresIn as SignOptions['expiresIn'],
};

export const JWT_SECRET: string = secret;
export const JWT_EXPIRES_IN: SignOptions['expiresIn'] = jwtExpiresIn as SignOptions['expiresIn'];

export default jwtConfig;