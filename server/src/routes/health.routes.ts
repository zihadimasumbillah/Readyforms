import { Router } from 'express';
import { healthCheck, ping, corsTest } from '../controllers/health.controller';

const router = Router();

// Basic health check endpoint
router.get('/', healthCheck);

// Specific ping endpoint for easy testing
router.get('/ping', ping);

// Special endpoint for testing CORS configuration
router.get('/cors', corsTest);

// Simple handler for OPTIONS requests
router.options('*', (req, res) => {
  // Add permissive CORS headers for health endpoints
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

export default router;