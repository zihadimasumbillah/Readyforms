import { Request, Response } from 'express';
import { Template, User, Topic, FormResponse, Comment, Like } from '../models';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';
import { optimisticUpdate, optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

// Get all templates
export const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
  const templates = await Template.findAll({
    where: { isPublic: true },
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json(templates);
});

// Get template by ID
export const getTemplateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate UUID format
  if (!isUuid(id)) {
    return res.status(400).json({ 
      message: 'Invalid template ID format. Please provide a valid UUID.' 
    });
  }
  
  const template = await Template.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] }
    ]
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  
  // Check if template is private and not owned by the user
  if (!template.isPublic && 
      (!req.user || (template.userId !== req.user.id && !req.user.isAdmin))) {
    return res.status(403).json({ message: 'Access denied to this template' });
  }
  
  res.status(200).json(template);
});

// Create new template
export const createTemplate = catchAsync(async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      isPublic, 
      topicId,
      customString1State,
      customString1Question,
      customString2State,
      customString2Question,
      customString3State,
      customString3Question,
      customString4State,
      customString4Question,
      customText1State,
      customText1Question,
      customText2State,
      customText2Question,
      customText3State,
      customText3Question,
      customText4State,
      customText4Question,
      customInt1State,
      customInt1Question,
      customInt2State,
      customInt2Question,
      customInt3State,
      customInt3Question,
      customInt4State,
      customInt4Question,
      customCheckbox1State,
      customCheckbox1Question,
      customCheckbox2State,
      customCheckbox2Question,
      customCheckbox3State,
      customCheckbox3Question,
      customCheckbox4State,
      customCheckbox4Question,
      questionOrder
    } = req.body;
    
    // Validate request
    if (!title || !topicId) {
      return res.status(400).json({ message: 'Title and topic are required' });
    }
    
    // Validate that at least one field is enabled
    if (!customString1State && !customString2State && !customString3State && !customString4State &&
        !customText1State && !customText2State && !customText3State && !customText4State &&
        !customInt1State && !customInt2State && !customInt3State && !customInt4State &&
        !customCheckbox1State && !customCheckbox2State && !customCheckbox3State && !customCheckbox4State) {
      return res.status(400).json({ message: 'At least one form field is required' });
    }
    
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const template = await Template.create({
      title,
      description: description || '',
      isPublic: isPublic === undefined ? true : isPublic,
      topicId,
      userId: req.user.id,
      customString1State: customString1State || false,
      customString1Question: customString1Question || '',
      customString2State: customString2State || false,
      customString2Question: customString2Question || '',
      customString3State: customString3State || false,
      customString3Question: customString3Question || '',
      customString4State: customString4State || false,
      customString4Question: customString4Question || '',
      customText1State: customText1State || false,
      customText1Question: customText1Question || '',
      customText2State: customText2State || false,
      customText2Question: customText2Question || '',
      customText3State: customText3State || false,
      customText3Question: customText3Question || '',
      customText4State: customText4State || false,
      customText4Question: customText4Question || '',
      customInt1State: customInt1State || false,
      customInt1Question: customInt1Question || '',
      customInt2State: customInt2State || false,
      customInt2Question: customInt2Question || '',
      customInt3State: customInt3State || false,
      customInt3Question: customInt3Question || '',
      customInt4State: customInt4State || false,
      customInt4Question: customInt4Question || '',
      customCheckbox1State: customCheckbox1State || false,
      customCheckbox1Question: customCheckbox1Question || '',
      customCheckbox2State: customCheckbox2State || false,
      customCheckbox2Question: customCheckbox2Question || '',
      customCheckbox3State: customCheckbox3State || false,
      customCheckbox3Question: customCheckbox3Question || '',
      customCheckbox4State: customCheckbox4State || false,
      customCheckbox4Question: customCheckbox4Question || '',
      questionOrder: questionOrder || '[]'
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Server error while creating template' });
  }
});

// Update template
export const updateTemplate = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      isPublic, 
      topicId,
      version,
      customString1State,
      customString1Question,
      customString2State,
      customString2Question,
      customString3State,
      customString3Question,
      customString4State,
      customString4Question,
      customText1State,
      customText1Question,
      customText2State,
      customText2Question,
      customText3State,
      customText3Question,
      customText4State,
      customText4Question,
      customInt1State,
      customInt1Question,
      customInt2State,
      customInt2Question,
      customInt3State,
      customInt3Question,
      customInt4State,
      customInt4Question,
      customCheckbox1State,
      customCheckbox1Question,
      customCheckbox2State,
      customCheckbox2Question,
      customCheckbox3State,
      customCheckbox3Question,
      customCheckbox4State,
      customCheckbox4Question,
      questionOrder
    } = req.body;
    
    // Validate UUID format
    if (!isUuid(id)) {
      return res.status(400).json({ 
        message: 'Invalid template ID format. Please provide a valid UUID.' 
      });
    }
    
    // Validate version for optimistic locking
    if (version === undefined) {
      return res.status(400).json({ 
        message: 'Version field is required for optimistic locking' 
      });
    }
    
    // Validate other required fields
    if (!title || !topicId) {
      return res.status(400).json({ message: 'Title and topic are required' });
    }
    
    // Find the template
    const template = await Template.findByPk(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if user is owner or admin
    const isOwner = template.userId === req.user.id;
    const isAdmin = req.user.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You must be the template owner or an admin to update this template.' 
      });
    }
    
    // Prepare update data
    const updateData = {
      title,
      description: description || '',
      isPublic: isPublic === undefined ? template.isPublic : isPublic,
      topicId,
      customString1State: customString1State || false,
      customString1Question: customString1Question || '',
      customString2State: customString2State || false,
      customString2Question: customString2Question || '',
      customString3State: customString3State || false,
      customString3Question: customString3Question || '',
      customString4State: customString4State || false,
      customString4Question: customString4Question || '',
      customText1State: customText1State || false,
      customText1Question: customText1Question || '',
      customText2State: customText2State || false,
      customText2Question: customText2Question || '',
      customText3State: customText3State || false,
      customText3Question: customText3Question || '',
      customText4State: customText4State || false,
      customText4Question: customText4Question || '',
      customInt1State: customInt1State || false,
      customInt1Question: customInt1Question || '',
      customInt2State: customInt2State || false,
      customInt2Question: customInt2Question || '',
      customInt3State: customInt3State || false,
      customInt3Question: customInt3Question || '',
      customInt4State: customInt4State || false,
      customInt4Question: customInt4Question || '',
      customCheckbox1State: customCheckbox1State || false,
      customCheckbox1Question: customCheckbox1Question || '',
      customCheckbox2State: customCheckbox2State || false,
      customCheckbox2Question: customCheckbox2Question || '',
      customCheckbox3State: customCheckbox3State || false,
      customCheckbox3Question: customCheckbox3Question || '',
      customCheckbox4State: customCheckbox4State || false,
      customCheckbox4Question: customCheckbox4Question || '',
      questionOrder: questionOrder || template.questionOrder
    };
    
    // Use optimistic locking for the update
    const updatedTemplate = await optimisticUpdate<Template>(
      Template,
      id,
      version,
      updateData
    );
    
    res.status(200).json({
      message: 'Template updated successfully',
      template: updatedTemplate,
      version: updatedTemplate.version // Explicitly include the version in the response
    });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error while updating template' });
  }
});

// Delete template
export const deleteTemplate = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get version from body, query params, or headers to handle various client implementations
    // Parse values to ensure they're handled consistently
    let version;
    if (req.body && req.body.version !== undefined) {
      version = Number(req.body.version);
    } else if (req.query && req.query.version !== undefined) {
      version = Number(req.query.version);
    } else if (req.headers && req.headers['x-version'] !== undefined) {
      version = Number(req.headers['x-version']);
    }
    
    // Validate UUID format
    if (!isUuid(id)) {
      return res.status(400).json({ 
        message: 'Invalid template ID format. Please provide a valid UUID.' 
      });
    }
    
    // Validate version for optimistic locking
    if (version === undefined || isNaN(version)) {
      return res.status(400).json({ 
        message: 'Version field is required for optimistic locking. Please provide it in the request body, query parameters, or X-Version header.' 
      });
    }
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if user is owner or admin
    const isOwner = template.userId === req.user.id;
    const isAdmin = req.user.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You must be the template owner or an admin to delete this template.' 
      });
    }
    
    // Delete associated records first
    await Comment.destroy({ where: { templateId: id } });
    await Like.destroy({ where: { templateId: id } });
    await FormResponse.destroy({ where: { templateId: id } });
    
    // Use optimistic locking for the delete
    await optimisticDelete(Template, id, version);
    
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error while deleting template' });
  }
});

// Search templates
export const searchTemplates = catchAsync(async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const templates = await Template.findAll({
      where: {
        isPublic: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Topic, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ message: 'Server error while searching templates' });
  }
});