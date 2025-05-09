import { Router } from 'express';
import { createFormResponse, getFormResponsesByUser, getFormResponseById, 
         getFormResponsesByTemplate, getAggregateData } from '../controllers/form-response.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();


router.get('/aggregate/:templateId', catchAsync(getAggregateData));
router.get('/template/:templateId/aggregate', catchAsync(getAggregateData));

router.use(catchAsync(authMiddleware));

router.post('/', catchAsync(createFormResponse));
router.get('/user', catchAsync(getFormResponsesByUser));  
router.get('/user/:userId', catchAsync(getFormResponsesByUser));  
router.get('/template/:templateId', catchAsync(getFormResponsesByTemplate));
router.get('/:id', catchAsync(getFormResponseById));

export default router;