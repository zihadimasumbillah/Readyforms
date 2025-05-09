import { Request, Response } from 'express';
import { Template, FormResponse, Like, Comment } from '../models';
import catchAsync from '../utils/catchAsync';

/**
 * @route GET /api/dashboard/stats
 */
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;

  const templatesCount = await Template.count({ where: { userId } });

  const responsesSubmittedCount = await FormResponse.count({ where: { userId } });

  const templatesCreatedByUser = await Template.findAll({ 
    attributes: ['id'],
    where: { userId } 
  });
  
  const templateIds = templatesCreatedByUser.map(template => template.id);
  
  const responsesReceivedCount = templateIds.length > 0 ?
    await FormResponse.count({ where: { templateId: templateIds } }) : 
    0;

  const likesCount = templateIds.length > 0 ?
    await Like.count({ where: { templateId: templateIds } }) :
    0;

  const commentsCount = templateIds.length > 0 ? 
    await Comment.count({ where: { templateId: templateIds } }) :
    0;

  res.status(200).json({
    templates: templatesCount,
    responses: {
      submitted: responsesSubmittedCount,
      received: responsesReceivedCount
    },
    social: {
      likes: likesCount,
      comments: commentsCount
    }
  });
});

/**
 * @route GET /api/dashboard/recent
 */
export const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.user.id;

  const recentTemplates = await Template.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  const templatesCreatedByUser = await Template.findAll({ 
    attributes: ['id'],
    where: { userId } 
  });
  
  const templateIds = templatesCreatedByUser.map(template => template.id);
  
  const recentResponses = templateIds.length > 0 ?
    await FormResponse.findAll({
      where: { templateId: templateIds },
      order: [['createdAt', 'DESC']],
      limit: 5
    }) :
    [];

  const recentSubmissions = await FormResponse.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [{ model: Template, attributes: ['id', 'title'] }]
  });

  res.status(200).json({
    recentTemplates,
    recentResponses,
    recentSubmissions
  });
});

/**
 * @route GET /api/dashboard/templates
 */
export const getUserTemplates = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const templates = await Template.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json(templates);
});

/**
 * @route GET /api/dashboard/responses
 */
export const getUserResponses = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const responses = await FormResponse.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    include: [{ model: Template, attributes: ['id', 'title', 'description'] }]
  });

  res.status(200).json(responses);
});
