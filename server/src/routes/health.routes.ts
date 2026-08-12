import express from 'express';
import { ping, checkDatabase, checkCors, fullCheck, status, checkEndpoints } from '../controllers/health.controller';

const router = express.Router();

// Public health check routes (no authentication required)
router.get('/ping', ping);
router.get('/database', checkDatabase);
router.get('/cors', checkCors);
router.get('/full', fullCheck);
router.get('/status', status);
router.get('/endpoints', checkEndpoints);
router.get('/', ping); // Add default route for /api/health

export default router;