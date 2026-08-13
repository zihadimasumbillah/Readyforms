import { Request, Response } from 'express';
import { User, Template, FormResponse, Topic, Comment, Like, Tag, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { isUuid } from '../utils/uuid';
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
  const id = req.params.id as string;
  
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
  const id = req.params.id as string;
  
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
  const id = req.params.id as string;
  
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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [usersCount, templatesCount, responsesCount, likesCount, commentsCount, topicsCount, activeUsers, adminCount] = await Promise.all([
    User.count(),
    Template.count(),
    FormResponse.count(),
    Like.count(),
    Comment.count(),
    Topic.count(),
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
    include: [
      { model: User, attributes: ['id', 'name', 'email'], required: false },
      { model: Topic, attributes: ['id', 'name'], required: false },
      { model: FormResponse, attributes: ['id'], required: false },
      { model: Tag, required: false }
    ],
    limit: limitNumber,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  const formattedTemplates = templates.map((t: any) => {
    const json = t.toJSON();
    const authorUser = json.User || json.user || null;
    const topicObj = json.Topic || json.topic || null;
    const formResponses = json.FormResponses || json.formResponses || [];
    return {
      ...json,
      user: authorUser,
      User: authorUser,
      author: authorUser,
      topic: topicObj,
      Topic: topicObj,
      responsesCount: formResponses.length,
      responseCount: formResponses.length,
    };
  });

  res.status(200).json({
    templates: formattedTemplates,
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
  const id = req.params.id as string;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid template ID format' });
  }
  
  const template = await Template.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'], required: false },
      { model: Topic, attributes: ['id', 'name'], required: false },
      { model: FormResponse, attributes: ['id'], required: false },
      { model: Tag, required: false }
    ]
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  const json = template.toJSON();
  const authorUser = json.User || json.user || null;
  const topicObj = json.Topic || json.topic || null;
  const formResponses = json.FormResponses || json.formResponses || [];

  res.status(200).json({
    ...json,
    user: authorUser,
    User: authorUser,
    author: authorUser,
    topic: topicObj,
    Topic: topicObj,
    responsesCount: formResponses.length,
    responseCount: formResponses.length,
  });
});

/**
 * @route GET /api/admin/responses
 */
export const getAllResponses = catchAsync(async (req: Request, res: Response) => {
  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
  const offset = (pageNumber - 1) * limitNumber;
  const templateId = req.query.templateId as string;

  const whereClause: any = {};
  if (templateId && isUuid(templateId)) {
    whereClause.templateId = templateId;
  }

  const { count, rows: responses } = await FormResponse.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, attributes: ['id', 'name', 'email'], required: false },
      { model: Template, attributes: ['id', 'title'], required: false },
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
  const id = req.params.id as string;
  
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid response ID format' });
  }
  
  const response = await FormResponse.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Template }
    ]
  });
  
  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }
  
  res.status(200).json(response);
});

/**
 * @route PUT /api/admin/responses/:id
 */
export const updateResponse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!isUuid(id)) {
    return res.status(400).json({ message: 'Invalid response ID format' });
  }

  const response = await FormResponse.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Template }
    ]
  });

  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }

  const allowedFields = [
    'customString1Answer', 'customString2Answer', 'customString3Answer', 'customString4Answer',
    'customText1Answer',   'customText2Answer',   'customText3Answer',   'customText4Answer',
    'customInt1Answer',    'customInt2Answer',    'customInt3Answer',    'customInt4Answer',
    'customCheckbox1Answer', 'customCheckbox2Answer', 'customCheckbox3Answer', 'customCheckbox4Answer',
    'score'
  ];

  const updateData: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  await response.update(updateData);
  res.status(200).json({
    message: 'Response updated successfully',
    response
  });
});

/**
 * @route DELETE /api/admin/responses/:id
 */
export const deleteResponse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
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
  const id = req.params.id as string;
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

/**
 * @route GET /api/admin/system-activity/:count?
 */
export const getSystemActivity = catchAsync(async (req: Request, res: Response) => {
  const count = Math.min(100, Math.max(1, parseInt(req.params.count as string) || 20));

  const [recentUsers, recentTemplates, recentResponses, recentComments, recentLikes] = await Promise.all([
    User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: count,
    }).catch(() => []),
    Template.findAll({
      attributes: ['id', 'title', 'userId', 'createdAt'],
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: count,
    }).catch(() => []),
    FormResponse.findAll({
      attributes: ['id', 'templateId', 'userId', 'createdAt', 'score'],
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Template, attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: count,
    }).catch(() => []),
    Comment.findAll({
      attributes: ['id', 'content', 'templateId', 'userId', 'createdAt'],
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Template, attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: count,
    }).catch(() => []),
    Like.findAll({
      attributes: ['id', 'templateId', 'userId', 'createdAt'],
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Template, attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: count,
    }).catch(() => []),
  ]);

  const activities: any[] = [];

  for (const u of recentUsers as any[]) {
    activities.push({
      id: `user-${u.id}`,
      type: 'user',
      description: `New user registration: ${u.name || u.email}`,
      timestamp: u.createdAt,
      user: { id: u.id, name: u.name, email: u.email },
    });
  }

  for (const t of recentTemplates as any[]) {
    const tUser = t.User || t.user || { name: 'Community Author' };
    activities.push({
      id: `template-${t.id}`,
      type: 'template',
      description: `New template created: "${t.title}"`,
      timestamp: t.createdAt,
      user: tUser,
      meta: { templateId: t.id, title: t.title },
    });
  }

  for (const r of recentResponses as any[]) {
    const rUser = r.User || r.user || { name: 'Respondent' };
    const rTmpl = r.Template || r.template || { title: 'Form' };
    activities.push({
      id: `response-${r.id}`,
      type: 'response',
      description: `Form response submitted for "${rTmpl.title || 'Form'}"`,
      timestamp: r.createdAt,
      user: rUser,
      meta: { responseId: r.id, templateId: r.templateId, score: r.score },
    });
  }

  for (const c of recentComments as any[]) {
    const cUser = c.User || c.user || { name: 'Community Member' };
    const cTmpl = c.Template || c.template || { title: 'Form' };
    activities.push({
      id: `comment-${c.id}`,
      type: 'comment',
      description: `New comment on "${cTmpl.title || 'Form'}": "${(c.content || '').slice(0, 40)}"`,
      timestamp: c.createdAt,
      user: cUser,
    });
  }

  for (const l of recentLikes as any[]) {
    const lUser = l.User || l.user || { name: 'Community Member' };
    const lTmpl = l.Template || l.template || { title: 'Form' };
    activities.push({
      id: `like-${l.id}`,
      type: 'like',
      description: `Liked form template "${lTmpl.title || 'Form'}"`,
      timestamp: l.createdAt,
      user: lUser,
    });
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.status(200).json(activities.slice(0, count));
});

/**
 * @route POST /api/admin/enrich-data
 */
export const enrichProductionData = catchAsync(async (req: Request, res: Response) => {
  const { enrichProductionData: runEnrichment } = require('../utils/seed');
  const result = await runEnrichment();
  res.status(200).json({
    message: 'Production data enriched successfully with verified accounts, responses, and activity.',
    ...result,
  });
});

