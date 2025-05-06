import { Request, Response } from 'express';
import { FormResponse, Template, User, sequelize } from '../models';
import catchAsync from '../utils/catchAsync';
import { QueryTypes } from 'sequelize';
import { validate as isUuid } from 'uuid';

// Create form response
export const createFormResponse = catchAsync(async (req: Request, res: Response) => {
  const { templateId, answers } = req.body;
  
  // Validate request
  if (!templateId || !answers) {
    return res.status(400).json({ message: 'Template ID and answers are required' });
  }
  
  // Check if template exists
  const template = await Template.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  const formResponse = await FormResponse.create({
    templateId,
    userId: req.user.id,
    ...answers // Spread individual answer fields
  });
  
  res.status(201).json(formResponse);
});

// Get form response by user
export const getFormResponsesByUser = catchAsync(async (req: Request, res: Response) => {
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

// Get form responses by template ID
export const getFormResponsesByTemplate = catchAsync(async (req: Request, res: Response) => {
  const { templateId } = req.params;
  
  // Validate UUID format
  if (!isUuid(templateId)) {
    return res.status(400).json({ 
      message: 'Invalid template ID format. Please provide a valid UUID.' 
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

// Get form response by ID
export const getFormResponseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate UUID format
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
  
  res.status(200).json(response);
});

// Get aggregate data for a template
export const getAggregateData = catchAsync(async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    // Validate UUID format
    if (!isUuid(templateId)) {
      return res.status(400).json({ 
        message: 'Invalid template ID format. Please provide a valid UUID.' 
      });
    }
    
    // Check if template exists
    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Get aggregate data for numeric fields
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
        SUM(CASE WHEN "customCheckbox4Answer" = true THEN 1 ELSE 0 END) as checkbox4_yes_count
      FROM form_responses
      WHERE "templateId" = :templateId
    `, {
      replacements: { templateId },
      type: QueryTypes.SELECT
    });
    
    // If no responses yet, return default structure
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
        total_responses: 0
      });
    }
    
    res.status(200).json(aggregateData[0]);
  } catch (error) {
    console.error('Error getting aggregate data:', error);
    res.status(500).json({ message: 'Server error while getting aggregate data' });
  }
});