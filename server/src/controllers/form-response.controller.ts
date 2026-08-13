import { Request, Response } from 'express';
import { FormResponse, Template, User, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { isUuid } from '../utils/uuid';
import { QueryTypes } from 'sequelize';

/**
 * @route POST /api/responses
 */
export const createFormResponse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const {
    templateId,
    customString1Answer, customString2Answer, customString3Answer, customString4Answer,
    customText1Answer,   customText2Answer,   customText3Answer,   customText4Answer,
    customInt1Answer,   customInt2Answer,   customInt3Answer,   customInt4Answer,
    customCheckbox1Answer, customCheckbox2Answer, customCheckbox3Answer, customCheckbox4Answer,
  } = req.body;

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

  // ─── Sanitize & validate inputs ─────────────────────────────────────────────
  const sanitizeString = (val: unknown, maxLen = 255): string | undefined => {
    if (val === null || val === undefined) return undefined;
    return String(val).trim().slice(0, maxLen) || undefined;
  };

  const sanitizeInt = (val: unknown): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    return isFinite(n) ? Math.trunc(n) : undefined;
  };

  const sanitizeBool = (val: unknown): boolean | undefined => {
    if (val === null || val === undefined) return undefined;
    return Boolean(val);
  };

  const response = await FormResponse.create({
    templateId,
    userId: req.user.id,
    customString1Answer: sanitizeString(customString1Answer),
    customString2Answer: sanitizeString(customString2Answer),
    customString3Answer: sanitizeString(customString3Answer),
    customString4Answer: sanitizeString(customString4Answer),
    customText1Answer:   sanitizeString(customText1Answer, 4000),
    customText2Answer:   sanitizeString(customText2Answer, 4000),
    customText3Answer:   sanitizeString(customText3Answer, 4000),
    customText4Answer:   sanitizeString(customText4Answer, 4000),
    customInt1Answer:    sanitizeInt(customInt1Answer),
    customInt2Answer:    sanitizeInt(customInt2Answer),
    customInt3Answer:    sanitizeInt(customInt3Answer),
    customInt4Answer:    sanitizeInt(customInt4Answer),
    customCheckbox1Answer: sanitizeBool(customCheckbox1Answer),
    customCheckbox2Answer: sanitizeBool(customCheckbox2Answer),
    customCheckbox3Answer: sanitizeBool(customCheckbox3Answer),
    customCheckbox4Answer: sanitizeBool(customCheckbox4Answer),
  });

  return res.status(201).json({
    message: 'Form response submitted successfully',
    response,
  });
});

/**
 * @route GET /api/responses/template/:templateId
 */
export const getFormResponsesByTemplate = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const templateId = req.params.templateId as string;

  if (!templateId || !isUuid(templateId)) {
    return res.status(400).json({ message: 'Valid template ID is required' });
  }

  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  if (template.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view these responses' });
  }

  const responses = await FormResponse.findAll({
    where: { templateId },
    include: [{ model: User, attributes: ['id', 'name', 'email'], required: false }],
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json(responses);
});

/**
 * @route GET /api/responses/:id
 */
export const getFormResponseById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const id = req.params.id as string;

  if (!id || !isUuid(id)) {
    return res.status(400).json({ message: 'Valid response ID is required' });
  }

  const response = await FormResponse.findByPk(id, {
    include: [
      { model: Template, required: false },
      { model: User, attributes: ['id', 'name', 'email'], required: false }
    ]
  });

  if (!response) {
    return res.status(404).json({ message: 'Form response not found' });
  }

  if (response.userId !== req.user.id && response.template?.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view this response' });
  }

  return res.status(200).json(response);
});

/**
 * @route GET /api/responses/user
 * @route GET /api/responses/user/:userId
 */
export const getFormResponsesByUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = req.params.userId as string;
  const targetUserId = userId || req.user.id;

  if (targetUserId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view these responses' });
  }

  const responses = await FormResponse.findAll({
    where: { userId: targetUserId },
    include: [{ model: Template, attributes: ['id', 'title', 'description'], required: false }],
    order: [['createdAt', 'DESC']]
  });

  return res.status(200).json(responses);
});

/**
 * @route GET /api/responses/aggregate/:templateId
 * Returns aggregate statistics for a template's responses.
 * Pushes all computation to PostgreSQL — O(1) memory, no full scan into Node.
 */
export const getAggregateData = catchAsync(async (req: Request, res: Response) => {
  // Auth guard: must be authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const templateId = req.params.templateId as string;

  if (!templateId || !isUuid(templateId)) {
    return res.status(400).json({ message: 'Valid template ID is required' });
  }

  const template = await Template.findByPk(templateId, {
    attributes: ['id', 'userId', 'isPublic'],
  });

  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  // Authorization: only owner, admin, or public template responses are accessible
  if (!template.isPublic && template.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view aggregate data for this template' });
  }

  // Single SQL aggregate — no in-memory row loading, no JS loops
  const results: any[] = await sequelize.query(
    `SELECT
      COUNT(*)::int                                                    AS total_responses,
      SUM(CASE WHEN "customCheckbox1Answer" = TRUE THEN 1 ELSE 0 END)::int AS checkbox1_true,
      SUM(CASE WHEN "customCheckbox2Answer" = TRUE THEN 1 ELSE 0 END)::int AS checkbox2_true,
      SUM(CASE WHEN "customCheckbox3Answer" = TRUE THEN 1 ELSE 0 END)::int AS checkbox3_true,
      SUM(CASE WHEN "customCheckbox4Answer" = TRUE THEN 1 ELSE 0 END)::int AS checkbox4_true,
      AVG("customInt1Answer")                                         AS avg_int1,
      AVG("customInt2Answer")                                         AS avg_int2,
      AVG("customInt3Answer")                                         AS avg_int3,
      AVG("customInt4Answer")                                         AS avg_int4
    FROM "form_responses"
    WHERE "templateId" = :templateId`,
    { replacements: { templateId }, type: QueryTypes.SELECT }
  );

  const result = results[0] || {};
  const parseAvg = (v: any) => (v !== null && v !== undefined ? parseFloat(v) : null);

  return res.status(200).json({
    total_responses: result.total_responses ?? 0,
    responseCount: result.total_responses ?? 0,
    checkboxStats: {
      customCheckbox1Answer: result.checkbox1_true ?? 0,
      customCheckbox2Answer: result.checkbox2_true ?? 0,
      customCheckbox3Answer: result.checkbox3_true ?? 0,
      customCheckbox4Answer: result.checkbox4_true ?? 0,
    },
    intStats: {
      customInt1Answer: parseAvg(result.avg_int1),
      customInt2Answer: parseAvg(result.avg_int2),
      customInt3Answer: parseAvg(result.avg_int3),
      customInt4Answer: parseAvg(result.avg_int4),
    },
  });
});

/**
 * @route PUT /api/responses/:id
 */
export const updateFormResponse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const id = req.params.id as string;
  if (!id || !isUuid(id)) {
    return res.status(400).json({ message: 'Valid response ID is required' });
  }

  const response = await FormResponse.findByPk(id, {
    include: [
      { model: Template },
      { model: User, attributes: ['id', 'name', 'email'] }
    ]
  });

  if (!response) {
    return res.status(404).json({ message: 'Form response not found' });
  }

  if (response.userId !== req.user.id && response.template?.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to edit this response' });
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
  return res.status(200).json({
    message: 'Form response updated successfully',
    response
  });
});

/**
 * @route DELETE /api/responses/:id
 */
export const deleteFormResponse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const id = req.params.id as string;
  if (!id || !isUuid(id)) {
    return res.status(400).json({ message: 'Valid response ID is required' });
  }

  const response = await FormResponse.findByPk(id, {
    include: [{ model: Template }]
  });

  if (!response) {
    return res.status(404).json({ message: 'Form response not found' });
  }

  if (response.userId !== req.user.id && response.template?.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to delete this response' });
  }

  await response.destroy();
  return res.status(200).json({ message: 'Form response deleted successfully' });
});