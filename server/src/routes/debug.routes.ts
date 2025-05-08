import { Router, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models';
import bcryptjs from 'bcryptjs';
import catchAsync from '../utils/catchAsync';
import jwtConfig from '../config/jwt.config';

const router = Router();

router.post('/verify-user', catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
        status: 'NOT_FOUND'
      });
    }

    const dbHash = user.password;

    let isValid = false;
    try {
      isValid = await bcryptjs.compare(password, dbHash);
    } catch (compareError) {
      const error = compareError as Error;
      return res.status(500).json({
        message: 'Error comparing passwords',
        bcryptError: error.message
      });
    }

    return res.json({
      isValid,
      user: {
        id: user.id,
        email: user.email,
        passwordHash: dbHash.substring(0, 10) + '...'
      }
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}));

router.post('/verify-token', catchAsync(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return res.status(400).json({
        message: 'Invalid token structure',
        decoded
      });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name', 'isAdmin']
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 'USER_NOT_FOUND'
      });
    }

    return res.json({
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    const error = err as Error;
    return res.status(400).json({
      message: 'Invalid or expired token',
      error: error.message
    });
  }
}));

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

export default router;
