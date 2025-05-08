import { Router } from 'express';
import { createFormResponse, getFormResponsesByUser, getFormResponseById, 
         getFormResponsesByTemplate, getAggregateData } from '../controllers/form-response.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Define the routes without middleware first
router.get('/aggregate/:templateId', catchAsync(getAggregateData));
router.get('/template/:templateId/aggregate', catchAsync(getAggregateData));

// Apply middleware to all routes
router.use(catchAsync(authMiddleware));

// Define protected routes
router.post('/', catchAsync(createFormResponse));
router.get('/user', catchAsync(getFormResponsesByUser));  
router.get('/user/:userId', catchAsync(getFormResponsesByUser));  
router.get('/template/:templateId', catchAsync(getFormResponsesByTemplate));
router.get('/:id', catchAsync(getFormResponseById));

export default router;