import { Request, Response } from 'express';
import { Template, User, FormResponse, Like, Comment, Topic, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';

interface StatisticsResult {
  active_users: number;
  total_templates: number;
  total_responses: number;
  public_templates: number;
}

/**
 * Get admin dashboard stats
 * @route GET /api/admin/stats
 */
export const getAdminStats = catchAsync(async (_req: Request, res: Response) => {
  try {
    // Count total users
    const usersCount = await User.count();
    
    // Count admin users
    const adminCount = await User.count({
      where: { isAdmin: true }
    });
    
    // Count templates
    const templatesCount = await Template.count();
    
    // Count form responses
    const responsesCount = await FormResponse.count();
    
    // Count likes
    const likesCount = await Like.count();
    
    // Count comments
    const commentsCount = await Comment.count();
    
    // Count topics
    const topicsCount = await Topic.count();
    
    // Count active users (users who have submitted a form response in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    interface ActiveUsersResult {
      active_users: number;
    }
    
    const activeUsers = await sequelize.query(
      `SELECT COUNT(DISTINCT "userId") as active_users
       FROM form_responses
       WHERE "createdAt" > :thirtyDaysAgo`,
      {
        replacements: { thirtyDaysAgo },
        type: sequelize.QueryTypes.SELECT
      }
    ) as ActiveUsersResult[];
    
    // Send stats
    res.status(200).json({
      users: usersCount,
      templates: templatesCount,
      responses: responsesCount,
      likes: likesCount,
      comments: commentsCount,
      activeUsers: activeUsers[0]?.active_users || 0,
      topicsCount,
      adminCount
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error while getting admin stats' });
  }
});

/**
 * Get system activity for admin dashboard
 * @route GET /api/admin/activity
 */
export const getSystemActivity = catchAsync(async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    // This is a simplified example - in a real app, you would have an activity log table
    // For this example, we'll combine recent templates, responses, and user registrations
    
    // Get recent templates
    const templates = await Template.findAll({
      include: [{ model: User, attributes: ['id', 'name'] }],
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Get recent form responses
    const responses = await FormResponse.findAll({
      include: [
        { model: Template, attributes: ['id', 'title'] },
        { model: User, attributes: ['id', 'name'] }
      ],
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Get recent user registrations
    const users = await User.findAll({
      limit,
      order: [['createdAt', 'DESC']]
    });
    
    // Combine and format activities
    const activities = [
      ...templates.map(template => ({
        id: template.id,
        type: 'template',
        action: 'created',
        title: template.title,
        user: template.user?.name || 'Unknown',
        timestamp: template.createdAt
      })),
      ...responses.map(response => ({
        id: response.id,
        type: 'response',
        action: 'submitted',
        title: response.template?.title || 'Unknown',
        user: response.user?.name || 'Unknown',
        timestamp: response.createdAt
      })),
      ...users.map(user => ({
        id: user.id,
        type: 'user',
        action: 'registered',
        title: '',
        user: user.name,
        timestamp: user.createdAt
      }))
    ]
    // Sort combined activities by timestamp
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    // Limit to requested number
    .slice(0, limit);
    
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error getting system activity:', error);
    res.status(500).json({ message: 'Server error while getting system activity' });
  }
});

/**
 * Get all templates (admin only)
 * @route GET /api/admin/templates
 */
export const getAllTemplates = catchAsync(async (_req: Request, res: Response) => {
  try {
    // Get all templates with enhanced information
    const templates = await Template.findAll({
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Topic, attributes: ['id', 'name'] }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM form_responses
              WHERE form_responses."templateId" = "Template"."id"
            )`),
            'responsesCount'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM likes
              WHERE likes."templateId" = "Template"."id"
            )`),
            'likesCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error getting all templates:', error);
    res.status(500).json({ message: 'Server error while getting all templates' });
  }
});

/**
 * Get system statistics
 * @route GET /api/admin/statistics
 */
export const getStatistics = catchAsync(async (req: Request, res: Response) => {
  try {
    // Only admins can access this (checked by middleware)
    
    // Get statistics via raw SQL query for efficiency
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM "Users" WHERE "blocked" = false) as active_users,
        (SELECT COUNT(*) FROM "Templates") as total_templates,
        (SELECT COUNT(*) FROM "FormResponses") as total_responses,
        (SELECT COUNT(*) FROM "Templates" WHERE "isPublic" = true) as public_templates
    `);
    
    // Cast results to proper interface
    const stats = results as unknown as StatisticsResult[];
    
    if (!stats.length) {
      return res.status(500).json({ message: 'Failed to retrieve statistics' });
    }
    
    res.status(200).json({
      statistics: {
        activeUsers: stats[0].active_users,
        totalTemplates: stats[0].total_templates,
        totalResponses: stats[0].total_responses,
        publicTemplates: stats[0].public_templates
      }
    });
  } catch (error) {
    console.error('Error getting admin statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all users with full details (admin only)
 * @route GET /api/admin/users
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  
  res.status(200).json(users);
});
