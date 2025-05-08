import { Request, Response } from 'express';
import { Like } from '../models/Like';
import { Template } from '../models/Template';
import catchAsync from '../utils/catchAsync';

/**
 * @route POST|DELETE /api/likes/template/:templateId
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { templateId } = req.params;
    
    if (!templateId) {
      return res.status(400).json({ message: 'Template ID is required' });
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
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route GET /api/likes/check/:templateId
 */
export const checkLike = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { templateId } = req.params;
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
  } catch (error) {
    console.error('Check like error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route GET /api/likes/count/:templateId
 */
export const countLikes = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
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
  } catch (error) {
    console.error('Count likes error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route GET /api/likes/template/:templateId
 */
export const getLikesByTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;

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