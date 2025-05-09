import { Request, Response } from 'express';
import { FormResponse, Template, User } from '../models';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';

/**
 * @route POST /api/responses
 */
export const createFormResponse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const {
    templateId,
    customString1Answer,
    customString2Answer,
    customString3Answer,
    customString4Answer,
    customText1Answer,
    customText2Answer,
    customText3Answer,
    customText4Answer,
    customInt1Answer,
    customInt2Answer,
    customInt3Answer,
    customInt4Answer,
    customCheckbox1Answer,
    customCheckbox2Answer,
    customCheckbox3Answer,
    customCheckbox4Answer
  } = req.body;


  if (!templateId) {
    return res.status(400).json({ message: 'Template ID is required' });
  }

  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  const response = await FormResponse.create({
    templateId,
    userId: req.user.id,
    customString1Answer,
    customString2Answer,
    customString3Answer,
    customString4Answer,
    customText1Answer,
    customText2Answer,
    customText3Answer,
    customText4Answer,
    customInt1Answer,
    customInt2Answer,
    customInt3Answer,
    customInt4Answer,
    customCheckbox1Answer,
    customCheckbox2Answer,
    customCheckbox3Answer,
    customCheckbox4Answer
  });

  return res.status(201).json(response);
});

/**
 * @route GET /api/responses/template/:templateId
 */
export const getFormResponsesByTemplate = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { templateId } = req.params;

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
    include: [{ model: User, attributes: ['id', 'name', 'email'] }]
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

  const { id } = req.params;

  if (!id || !isUuid(id)) {
    return res.status(400).json({ message: 'Valid response ID is required' });
  }

  const response = await FormResponse.findByPk(id, {
    include: [
      { model: Template },
      { model: User, attributes: ['id', 'name'] }
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

  const { userId } = req.params;
  const targetUserId = userId || req.user.id;

  if (targetUserId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized to view these responses' });
  }

  const responses = await FormResponse.findAll({
    where: { userId: targetUserId },
    include: [{ model: Template, attributes: ['id', 'title', 'description'] }]
  });

  return res.status(200).json(responses);
});

/**
 * @route GET /api/responses/aggregate/:templateId
 */
export const getAggregateData = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;

  if (!templateId || !isUuid(templateId)) {
    return res.status(400).json({ message: 'Valid template ID is required' });
  }

  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  const responses = await FormResponse.findAll({
    where: { templateId },
    attributes: [
      'customString1Answer', 'customString2Answer', 'customString3Answer', 'customString4Answer',
      'customInt1Answer', 'customInt2Answer', 'customInt3Answer', 'customInt4Answer',
      'customCheckbox1Answer', 'customCheckbox2Answer', 'customCheckbox3Answer', 'customCheckbox4Answer'
    ]
  });

  const aggregateData = {
    total_responses: responses.length,
    responseCount: responses.length,
    checkboxStats: {
      customCheckbox1Answer: responses.filter(r => r.customCheckbox1Answer === true).length,
      customCheckbox2Answer: responses.filter(r => r.customCheckbox2Answer === true).length,
      customCheckbox3Answer: responses.filter(r => r.customCheckbox3Answer === true).length,
      customCheckbox4Answer: responses.filter(r => r.customCheckbox4Answer === true).length
    },
    intStats: {
      customInt1Answer: calculateAverage(responses.map(r => r.customInt1Answer)),
      customInt2Answer: calculateAverage(responses.map(r => r.customInt2Answer)),
      customInt3Answer: calculateAverage(responses.map(r => r.customInt3Answer)),
      customInt4Answer: calculateAverage(responses.map(r => r.customInt4Answer))
    }
  };

  return res.status(200).json(aggregateData);
});

function calculateAverage(values) {
  const numericValues = values.filter(v => v !== null && v !== undefined);
  if (numericValues.length === 0) return null;
  return numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
}