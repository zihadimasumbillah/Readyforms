import { Router } from 'express';
import { createFormResponse, getFormResponsesByUser, getFormResponseById, 
         getFormResponsesByTemplate, getAggregateData } from '../controllers/form-response.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Apply auth middleware to all routes
router.use(catchAsync(authMiddleware));

// Create form response
router.post('/', catchAsync(createFormResponse));

// Get form responses by user - separate routes for with and without userId
router.get('/user', catchAsync(getFormResponsesByUser));  // Current user's responses
router.get('/user/:userId', catchAsync(getFormResponsesByUser));  // Specific user's responses

// Get form response by ID
router.get('/:id', catchAsync(getFormResponseById));

// Get form responses by template
router.get('/template/:templateId', catchAsync(getFormResponsesByTemplate));

// Get aggregate data for a template
router.get('/template/:templateId/aggregate', catchAsync(getAggregateData));

export default router;