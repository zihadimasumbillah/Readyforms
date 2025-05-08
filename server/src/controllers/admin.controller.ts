import { Request, Response } from 'express';
import { Template, User, FormResponse, Like, Comment, Topic, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { QueryTypes } from 'sequelize';

interface ActiveUserCount {
  active_users: number;
}

interface DashboardData {
  userCount: number;
  templateCount: number;
  responseCount: number;
  activeUsers: number;
  recentTemplates: any[];
  recentResponses: any[];
}

interface StatisticsResult {
  active_users: number;
  total_templates: number;
  total_responses: number;
  public_templates: number;
}

interface ActiveUsersResult {
  active_users: number;
}

/**
 * @route GET /api/admin/dashboard
 */
export const getDashboardData = catchAsync(async (req: Request, res: Response) => {
  try {
    const userCount = await User.count();
    const templateCount = await Template.count();
    const responseCount = await FormResponse.count();

    const recentTemplates = await Template.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    
    const recentResponses = await FormResponse.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Template, attributes: ['id', 'title'] }
      ]
    });
    
    const [activeUsersResult] = await sequelize.query(
      `SELECT COUNT(*) as active_users FROM "Users" WHERE "lastLoginAt" > NOW() - INTERVAL '7 days'`,
      { type: QueryTypes.SELECT }
    ) as ActiveUserCount[];
    
    const dashboardData: DashboardData = {
      userCount,
      templateCount,
      responseCount,
      activeUsers: activeUsersResult.active_users,
      recentTemplates,
      recentResponses
    };
    
    res.json(dashboardData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Admin dashboard error:', errorMessage);
    res.status(500).json({ message: 'Failed to retrieve dashboard data' });
  }
});

/**
 * @route GET /api/admin/stats
 */
export const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  try {
    const stats = {
      totalUsers: await User.count(),
      newUsersLast30Days: await User.count({
        where: sequelize.literal("\"createdAt\" > NOW() - INTERVAL '30 days'")
      }),
      totalTemplates: await Template.count(),
      totalResponses: await FormResponse.count(),
      responseRate: 0 
    };
    
    if (stats.totalTemplates > 0) {
      stats.responseRate = stats.totalResponses / stats.totalTemplates;
    }
    
    res.json(stats);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Admin stats error:', errorMessage);
    res.status(500).json({ message: 'Failed to retrieve admin stats' });
  }
});

/**
 * @route GET /api/admin/activity
 */
export const getSystemActivity = catchAsync(async (req: Request, res: Response) => {
  try {
    const userActivity = await User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const templateActivity = await Template.findAll({
      attributes: ['id', 'title', 'createdAt'],
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const responseActivity = await FormResponse.findAll({
      attributes: ['id', 'createdAt'],
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Template, attributes: ['title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json({
      userActivity,
      templateActivity,
      responseActivity
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('System activity error:', errorMessage);
    res.status(500).json({ message: 'Failed to retrieve system activity' });
  }
});

/**
 * @route GET /api/admin/templates
 */
export const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
  try {
    const templates = await Template.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(templates);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Get all templates error:', errorMessage);
    res.status(500).json({ message: 'Failed to retrieve templates' });
  }
});

/**
 * @route GET /api/admin/users
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt', 'lastLoginAt']
  });
  
  res.json(users);
});

/**
 * @route PUT /api/admin/users/:id
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  
  const user = await User.findByPk(id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await user.update({ isAdmin });
  
  res.json({ message: 'User updated successfully', user });
});

/**
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const user = await User.findByPk(id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  await user.destroy();
  
  res.json({ message: 'User deleted successfully' });
});
