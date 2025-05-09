import { Request, Response } from 'express';
import Like from '../models/Like';
import Template from '../models/Template';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';

/**
 * @route POST|DELETE /api/likes/template/:templateId
 */
export const toggleLike = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { templateId } = req.params;
  
  if (!templateId) {
    return res.status(400).json({ message: 'Template ID is required' });
  }
  
  if (!isUuid(templateId)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(templateId);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  const existingLike = await Like.findOne({
    where: {
      userId: req.user.id,
      templateId
    }
  });
  
  if (existingLike) {
    await existingLike.destroy();
    
    return res.status(200).json({
      message: 'Template unliked successfully',
      liked: false
    });
  }
  
  await Like.create({
    userId: req.user.id,
    templateId
  });
  
  return res.status(201).json({
    message: 'Template liked successfully',
    liked: true
  });
});

/**
 * @route GET /api/likes/check/:templateId
 */
export const checkLike = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const { templateId } = req.params;
  
  if (!isUuid(templateId)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(templateId);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  const like = await Like.findOne({
    where: {
      userId: req.user.id,
      templateId
    }
  });
  
  return res.status(200).json({
    liked: !!like
  });
});

/**
 * @route GET /api/likes/count/:templateId
 */
export const countLikes = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  
  if (!isUuid(templateId)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(templateId);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  const count = await Like.count({
    where: {
      templateId
    }
  });
  
  return res.status(200).json({
    count
  });
});

/**
 * @route GET /api/likes/template/:templateId
 */
export const getLikesByTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;

  if (!isUuid(templateId)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  const likes = await Like.findAll({
    where: { templateId }
  });
  
  res.status(200).json({
    templateId,
    likesCount: likes.length,
    likes
  });
});