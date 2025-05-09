import { Router } from 'express';
import { healthCheck, pingApi, corsTest } from '../controllers/health.controller';

const router = Router();

// Health check endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API health check passed',
    timestamp: new Date().toISOString()
  });
});

router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

router.get('/cors', (req, res) => {
  res.status(200).json({
    message: 'CORS test successful',
    origin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString()
  });
});

// Export the router - make sure there's only one default export
export default router;