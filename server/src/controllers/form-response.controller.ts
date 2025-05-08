import { Request, Response } from 'express';
import { FormResponse, Template, User, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { QueryTypes } from 'sequelize';
import { validate as isUuid } from 'uuid';


export const createFormResponse = catchAsync(async (req: Request, res: Response) => {
  const { templateId, answers } = req.body;
  
  if (!templateId || !answers) {
    return res.status(400).json({ message: 'Template ID and answers are required' });
  }
  
  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required to submit form responses',
      requiresAuth: true
    });
  }

  let score = 0;
  let totalPossiblePoints = 0;

  if (template.scoringCriteria) {
    try {
      const scoringCriteria = JSON.parse(template.scoringCriteria || '{}');
      Object.keys(answers).forEach(key => {
        if (scoringCriteria[key]) {
          totalPossiblePoints += scoringCriteria[key].points || 0;
          if (answers[key] === scoringCriteria[key].answer) {
            score += scoringCriteria[key].points || 0;
          }
        }
      });
    } catch (error) {
      console.error('Error parsing scoring criteria:', error);
    }
  }
  
 
  const formResponse = await FormResponse.create({
    templateId,
    userId: req.user.id,
    score: score,
    totalPossiblePoints: totalPossiblePoints,
    ...(typeof answers === 'object' ? answers : {})
  });
  
  res.status(201).json({
    ...formResponse.toJSON(),
    score,
    totalPossiblePoints,
    percentScore: totalPossiblePoints > 0 ? Math.round((score / totalPossiblePoints) * 100) : null
  });
});

export const getFormResponsesByUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userId = req.params.userId || req.user.id;
  
  const responses = await FormResponse.findAll({
    where: { userId },
    include: [
      {
        model: Template,
        attributes: ['id', 'title']
      }
    ]
  });
  
  res.status(200).json(responses);
});

export const getFormResponsesByTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!isUuid(templateId)) {
    return res.status(400).json({ 
      message: 'Invalid template ID format. Please provide a valid UUID.' 
    });
  }

  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  const isTemplateOwner = req.user.id === template.userId;
  const isAdmin = req.user.isAdmin === true;
  if (!isTemplateOwner && !isAdmin) {
    return res.status(403).json({ 
      message: 'You do not have permission to view all responses for this template' 
    });
  }

  const responses = await FormResponse.findAll({
    where: { templateId },
    include: [
      {
        model: Template,
        attributes: ['id', 'title']
      },
      {
        model: User,
        attributes: ['id', 'name', 'email']
      }
    ]
  });
  
  res.status(200).json(responses);
});

export const getFormResponseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!isUuid(id)) {
    return res.status(400).json({ 
      message: 'Invalid response ID format. Please provide a valid UUID.' 
    });
  }
  
  const response = await FormResponse.findByPk(id, {
    include: [
      {
        model: Template,
        attributes: ['id', 'title']
      },
      {
        model: User,
        attributes: ['id', 'name', 'email']
      }
    ]
  });
  
  if (!response) {
    return res.status(404).json({ message: 'Form response not found' });
  }

  const isResponseOwner = req.user.id === response.userId;
  const isTemplateOwner = req.user.id === response.template.userId;
  const isAdmin = req.user.isAdmin === true;
  
  if (!isResponseOwner && !isTemplateOwner && !isAdmin) {
    return res.status(403).json({ message: 'You do not have permission to view this response' });
  }
  
  res.status(200).json(response);
});

export const getAggregateData = catchAsync(async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    if (!isUuid(templateId)) {
      return res.status(400).json({ 
        message: 'Invalid template ID format. Please provide a valid UUID.' 
      });
    }

    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const aggregateData = await sequelize.query(`
      SELECT 
        AVG(NULLIF("customInt1Answer", 0)) as avg_custom_int1,
        AVG(NULLIF("customInt2Answer", 0)) as avg_custom_int2,
        AVG(NULLIF("customInt3Answer", 0)) as avg_custom_int3,
        AVG(NULLIF("customInt4Answer", 0)) as avg_custom_int4,
        COUNT(*) as total_responses,
        COUNT(NULLIF("customString1Answer", '')) as string1_count,
        COUNT(NULLIF("customString2Answer", '')) as string2_count,
        COUNT(NULLIF("customString3Answer", '')) as string3_count,
        COUNT(NULLIF("customString4Answer", '')) as string4_count,
        COUNT(NULLIF("customText1Answer", '')) as text1_count,
        COUNT(NULLIF("customText2Answer", '')) as text2_count,
        COUNT(NULLIF("customText3Answer", '')) as text3_count,
        COUNT(NULLIF("customText4Answer", '')) as text4_count,
        SUM(CASE WHEN "customCheckbox1Answer" = true THEN 1 ELSE 0 END) as checkbox1_yes_count,
        SUM(CASE WHEN "customCheckbox2Answer" = true THEN 1 ELSE 0 END) as checkbox2_yes_count,
        SUM(CASE WHEN "customCheckbox3Answer" = true THEN 1 ELSE 0 END) as checkbox3_yes_count,
        SUM(CASE WHEN "customCheckbox4Answer" = true THEN 1 ELSE 0 END) as checkbox4_yes_count,
        AVG("score") as avg_score,
        MAX("score") as max_score,
        MIN("score") as min_score,
        AVG("totalPossiblePoints") as avg_total_points
      FROM form_responses
      WHERE "templateId" = :templateId
    `, {
      replacements: { templateId },
      type: QueryTypes.SELECT
    });
    
    if (!aggregateData || aggregateData.length === 0) {
      return res.status(200).json({
        avg_custom_int1: null,
        avg_custom_int2: null,
        avg_custom_int3: null,
        avg_custom_int4: null,
        string1_count: 0,
        string2_count: 0,
        string3_count: 0,
        string4_count: 0,
        text1_count: 0,
        text2_count: 0,
        text3_count: 0,
        text4_count: 0,
        checkbox1_yes_count: 0,
        checkbox2_yes_count: 0,
        checkbox3_yes_count: 0,
        checkbox4_yes_count: 0,
        total_responses: 0,
        avg_score: 0,
        max_score: 0,
        min_score: 0,
        avg_total_points: 0
      });
    }
    
    res.status(200).json(aggregateData[0]);
  } catch (error) {
    console.error('Error getting aggregate data:', error);
    res.status(500).json({ message: 'Server error while getting aggregate data' });
  }
});