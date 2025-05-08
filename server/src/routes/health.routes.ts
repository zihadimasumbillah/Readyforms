import { Router } from 'express';
import { getApiStatus, getSystemStatus } from '../controllers/health.controller';
import catchAsync from '../utils/catchAsync';

const router = Router();
router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});
router.get('/api', catchAsync(getApiStatus));
router.get('/system', catchAsync(getSystemStatus));

export default router;
