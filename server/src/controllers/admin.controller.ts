import { Request, Response } from 'express';
import { User, Template, FormResponse, Topic, Comment, Like, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';
import { Op } from 'sequelize';


/**
 * @route GET /api/admin/users
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows: users } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    limit: limitNumber,
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    users,
    meta: {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
    },
  });
});

export const getUsers = getAllUsers;

/**
 * @route GET /api/admin/users-count
 */
export const getUsersCount = catchAsync(async (req: Request, res: Response) => {
  const count = await User.count();
  res.status(200).json({ count });
});

/**
 * @route GET /api/admin/users/:id
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.status(200).json(user);
});

/**
 * @route PUT /api/admin/users/:id/block
 */
export const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  
  if (id === req.user?.id) {
    return res.status(400).json({ message: 'Cannot block yourself' });
  }
  
  const user = await User.findByPk(id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await user.update({ blocked: !user.blocked });
  
  res.status(200).json({
    message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      blocked: user.blocked
    }
  });
});

/**
 * @route PUT /api/admin/users/:id/admin
 */
export const toggleUserAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }
  
  if (id === req.user?.id) {
    return res.status(400).json({ message: 'Cannot change your own admin status' });
  }
  
  const user = await User.findByPk(id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await user.update({ isAdmin: !user.isAdmin });
  
  res.status(200).json({
    message: `User ${user.isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

/**
 * @route GET /api/admin/dashboard-stats
 */
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const [usersCount, templatesCount, responsesCount, likesCount, commentsCount, topicsCount] = await Promise.all([
    User.count(),
    Template.count(),
    FormResponse.count(),
    Like.count(),
    Comment.count(),
    Topic.count(),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeUsers, adminCount] = await Promise.all([
    User.count({ where: { lastLoginAt: { [Op.gte]: thirtyDaysAgo } } }),
    User.count({ where: { isAdmin: true } }),
  ]);

  res.status(200).json({
    users: usersCount,
    templates: templatesCount,
    responses: responsesCount,
    likes: likesCount,
    comments: commentsCount,
    topicsCount: topicsCount,
    activeUsers: activeUsers,
    adminCount: adminCount,
  });
});

/**
 * @route GET /api/admin/templates
 */
export const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows: templates } = await Template.findAndCountAll({
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    limit: limitNumber,
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    templates,
    meta: {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
    },
  });
});


export const getTemplates = getAllTemplates;

/**
 * @route GET /api/admin/templates/:id
 */
export const getTemplateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] }
    ]
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  res.status(200).json(template);
});

/**
 * @route GET /api/admin/responses
 */
export const getAllResponses = catchAsync(async (req: Request, res: Response) => {
  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  const offset = (pageNumber - 1) * limitNumber;

  const { count, rows: responses } = await FormResponse.findAndCountAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Template, attributes: ['id', 'title'] },
    ],
    limit: limitNumber,
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    responses,
    meta: {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber),
    },
  });
});

export const getResponses = getAllResponses;

/**
 * @route GET /api/admin/responses/:id
 */
export const getResponseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid response ID format' });
  }
  
  const response = await FormResponse.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Template, attributes: ['id', 'title'] }
    ]
  });
  
  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }
  
  res.status(200).json(response);
});

/**
 * @route DELETE /api/admin/responses/:id
 */
export const deleteResponse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid response ID format' });
  }

  const response = await FormResponse.findByPk(id);
  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }

  await response.destroy();
  res.status(200).json({ message: 'Response deleted successfully' });
});

/**
 * @route DELETE /api/admin/templates/:id
 */
export const deleteTemplate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }

  const template = await Template.findByPk(id);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  await Comment.destroy({ where: { templateId: id } });
  await Like.destroy({ where: { templateId: id } });
  await FormResponse.destroy({ where: { templateId: id } });
  await template.destroy();

  res.status(200).json({ message: 'Template deleted successfully' });
});

/**
 * @route GET /api/admin/topics
 */
export const getAllTopics = catchAsync(async (req: Request, res: Response) => {
  const topics = await Topic.findAll({
    order: [['name', 'ASC']],
  });
  res.status(200).json(topics);
});

