import express from 'express';
import { createFormResponse, getFormResponsesByTemplate, getFormResponseById, getFormResponsesByUser, getAggregateData } from '../controllers/form-response.controller';
import verifyToken from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', verifyToken, createFormResponse);

router.get('/template/:templateId', verifyToken, getFormResponsesByTemplate);

router.get('/user', verifyToken, getFormResponsesByUser);
router.get('/user/:userId', verifyToken, getFormResponsesByUser);

router.get('/aggregate/:templateId', getAggregateData);

router.get('/:id', verifyToken, getFormResponseById);

export default router;