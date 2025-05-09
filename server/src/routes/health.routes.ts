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

/**
 * @route GET /api/health/debug
 * @access Protected (requires debug token in production)
 */
router.get('/debug', healthController.debug);

export default router;
