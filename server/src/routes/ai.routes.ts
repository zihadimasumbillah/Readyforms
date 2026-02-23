import express from 'express';
import { generateFormController, improveFormController } from '../controllers/ai.controller';

const router = express.Router();

router.post('/generate-form', generateFormController);
router.post('/improve-form', improveFormController);

export default router;
