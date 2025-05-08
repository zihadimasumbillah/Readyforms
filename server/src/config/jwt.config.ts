import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET ?? 'readyforms-secret-key';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '24h';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ?? 'readyforms-refresh-secret-key';
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

const jwtConfig = {
  secret: jwtSecret,
  expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
  refreshSecret: jwtRefreshSecret,
  refreshExpiresIn: jwtRefreshExpiresIn as SignOptions['expiresIn']
};


export const JWT_SECRET: string = jwtSecret;
export const JWT_EXPIRES_IN: SignOptions['expiresIn'] = jwtExpiresIn as SignOptions['expiresIn'];

export default jwtConfig;