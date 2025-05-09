import { Request, Response } from 'express';
import { User, Template, FormResponse, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';
import { Op } from 'sequelize'; 

/**
 * @route GET /api/admin/users
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  
  res.status(200).json({
    users,
    count: users.length
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
  const usersCount = await User.count();
  const templatesCount = await Template.count();
  const responsesCount = await FormResponse.count();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activeUsers = await User.count({
    where: {
      lastLoginAt: {
        [Op.gte]: thirtyDaysAgo
      }
    }
  });
  
  const adminCount = await User.count({
    where: { isAdmin: true }
  });
  
  res.status(200).json({
    users: usersCount,
    templates: templatesCount,
    responses: responsesCount,
    activeUsers: activeUsers,
    adminCount: adminCount
  });
});

/**
 * @route GET /api/admin/templates
 */
export const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
  const templates = await Template.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] }
    ]
  });
  
  res.status(200).json(templates);
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
  const responses = await FormResponse.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Template, attributes: ['id', 'title'] }
    ]
  });
  
  res.status(200).json(responses);
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
 * @route GET /api/admin/system-activity/:count?
 */
export const getSystemActivity = catchAsync(async (req: Request, res: Response) => {
  const count = req.params.count ? parseInt(req.params.count) : 10;
  
  const mockActivity = [
    {
      id: '1',
      type: 'user',
      action: 'created',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: '2',
      type: 'template',
      action: 'updated',
      user: 'Admin User',
      title: 'Customer Survey',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString()
    },
    {
      id: '3',
      type: 'response',
      action: 'submitted',
      user: 'Alice Smith',
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString()
    },
    {
      id: '4',
      type: 'user',
      action: 'blocked',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString()
    },
    {
      id: '5',
      type: 'template',
      action: 'created',
      user: 'Bob Johnson',
      title: 'Feedback Form',
      timestamp: new Date(Date.now() - 12 * 60 * 60000).toISOString()
    }
  ];
  
  res.status(200).json(mockActivity.slice(0, count));
});
