import express from 'express';
import { generateFormController, improveFormController } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/generate-form', verifyToken, generateFormController);
router.post('/improve-form', verifyToken, improveFormController);

export default router;
