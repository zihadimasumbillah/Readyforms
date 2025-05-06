import { Request, Response } from 'express';
import { Template, FormResponse, Like, Comment, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';

/**
 * Get user dashboard stats
 * @route GET /api/dashboard/stats
 */
export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Count templates created by user
    const templatesCount = await Template.count({
      where: { userId: req.user.id }
    });
    
    // Count responses by user
    const responsesCount = await FormResponse.count({
      where: { userId: req.user.id }
    });
    
    // Count likes on user's templates
    const likesCount = await Like.count({
      include: [{
        model: Template,
        where: { userId: req.user.id }
      }]
    });
    
    // Count comments on user's templates
    const commentsCount = await Comment.count({
      include: [{
        model: Template,
        where: { userId: req.user.id }
      }]
    });
    
    res.status(200).json({
      templates: templatesCount,
      responses: responsesCount,
      likes: likesCount,
      comments: commentsCount
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error while getting user stats' });
  }
});

/**
 * Get user templates
 * @route GET /api/dashboard/templates
 */
export const getUserTemplates = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get templates created by user with form response count
    const templates = await Template.findAll({
      where: { userId: req.user.id },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM form_responses
              WHERE form_responses."templateId" = "Template"."id"
            )`),
            'responsesCount'
          ]
        ]
      },
      include: [
        { association: 'topic', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error getting user templates:', error);
    res.status(500).json({ message: 'Server error while getting user templates' });
  }
});

/**
 * Get user's form responses
 * @route GET /api/dashboard/responses
 */
export const getUserResponses = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get form responses submitted by user
    const responses = await FormResponse.findAll({
      where: { userId: req.user.id },
      include: [{ association: 'template', attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error getting user responses:', error);
    res.status(500).json({ message: 'Server error while getting user responses' });
  }
});

/**
 * Get recent activity
 * @route GET /api/dashboard/activity
 */
export const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    
    // This is a simplified example - in a real app, you would have an activity log table
    // For this example, we'll combine recent responses to user's templates and recent comments
    
    // Get recent responses to user's templates
    const responses = await FormResponse.findAll({
      include: [{
        model: Template,
        where: { userId: req.user.id },
        attributes: ['id', 'title']
      }],
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Get recent comments on user's templates
    const comments = await Comment.findAll({
      include: [{
        model: Template,
        where: { userId: req.user.id },
        attributes: ['id', 'title']
      }],
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Combine and format activities
    const activities = [
      ...responses.map(response => ({
        id: response.id,
        type: 'response',
        templateId: response.templateId,
        templateTitle: response.template.title,
        userName: 'A user', // In a real app, include the user's name
        timestamp: response.createdAt
      })),
      ...comments.map(comment => ({
        id: comment.id,
        type: 'comment',
        templateId: comment.templateId,
        templateTitle: comment.template.title,
        userName: 'A user', // In a real app, include the user's name
        content: comment.content,
        timestamp: comment.createdAt
      }))
    ]
    // Sort combined activities by timestamp
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    // Limit to requested number
    .slice(0, limit);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({ message: 'Server error while getting recent activity' });
  }
});
