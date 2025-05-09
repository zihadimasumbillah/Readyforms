import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

/**
 * @route GET /api/health/ping
 * @access Public
 */
router.get('/ping', healthController.ping);

/**
 * @route GET /api/health/status
 * @access Public
 */
router.get('/status', healthController.status);

/**

 * @route GET /api/health/cors
 * @access Public
 */
router.get('/cors', healthController.corsCheck);

export default router;
