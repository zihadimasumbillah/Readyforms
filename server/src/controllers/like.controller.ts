import { Request, Response } from 'express';
import { Like } from '../models/Like';
import { Template } from '../models/Template';
import catchAsync from '../utils/catchAsync';

/**
 * Toggle like for a template (like if not liked, unlike if already liked)
 * @route POST|DELETE /api/likes/template/:templateId
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get templateId from route params instead of request body
    const { templateId } = req.params;
    
    if (!templateId) {
      return res.status(400).json({ message: 'Template ID is required' });
    }
    
    // Verify that the template exists
    const template = await Template.findByPk(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check if user has already liked this template
    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        templateId
      }
    });
    
    // If like exists, remove it (unlike)
    if (existingLike) {
      await existingLike.destroy();
      
      return res.status(200).json({
        message: 'Template unliked successfully',
        liked: false
      });
    }
    
    // Otherwise, add a new like
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
 * Check if the current user has liked a template
 * @route GET /api/likes/check/:templateId
 */
export const checkLike = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { templateId } = req.params;
    
    // Verify that the template exists
    const template = await Template.findByPk(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check if user has liked this template
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
 * Count likes for a template
 * @route GET /api/likes/count/:templateId
 */
export const countLikes = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    // Verify that the template exists
    const template = await Template.findByPk(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Count likes for this template
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
 * Get likes by template
 * @route GET /api/likes/template/:templateId
 */
export const getLikesByTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  
  // Check if template exists
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