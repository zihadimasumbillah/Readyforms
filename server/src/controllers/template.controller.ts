import { Request, Response } from 'express';
import { Template, User, Topic, FormResponse, Comment, Like, Tag, TemplateTag } from '../models';
import { Op } from 'sequelize';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';
import { optimisticUpdate, optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

export const getAllTemplates = catchAsync(async (req: Request, res: Response) => {
  const { limit = 10, page = 1 } = req.query;
 
  const pageNumber = Math.max(1, parseInt(page as string) || 1);
  const limitNumber = Math.max(1, Math.min(50, parseInt(limit as string) || 10)); 
  const offset = (pageNumber - 1) * limitNumber;
  
  const { count, rows: templates } = await Template.findAndCountAll({
    where: { isPublic: true },
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] },
      { model: Tag }
    ],
    order: [['createdAt', 'DESC']],
    limit: limitNumber,
    offset: offset,
    distinct: true,
  });
  
  // Return structured response with metadata while maintaining array compatibility if needed
  res.status(200).json({
    data: templates,
    meta: {
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(count / limitNumber)
    }
  });
});

export const getTemplateById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ 
      message: 'Invalid template ID format. Please provide a valid UUID.' 
    });
  }
  
  const template = await Template.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] },
      { model: Tag }
    ]
  });
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  if (!template.isPublic && 
      (!req.user || (template.userId !== req.user.id && !req.user.isAdmin))) {
    return res.status(403).json({ message: 'Access denied to this template' });
  }
  
  res.status(200).json(template);
});

export const createTemplate = catchAsync(async (req: Request, res: Response) => {
  // Auth FIRST — reject before any DB I/O to prevent timing-based probing
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const {
    title,
    description,
    isPublic,
    topicId,
    tags,
    customString1State, customString1Question,
    customString2State, customString2Question,
    customString3State, customString3Question,
    customString4State, customString4Question,
    customText1State,   customText1Question,
    customText2State,   customText2Question,
    customText3State,   customText3Question,
    customText4State,   customText4Question,
    customInt1State,    customInt1Question,
    customInt2State,    customInt2Question,
    customInt3State,    customInt3Question,
    customInt4State,    customInt4Question,
    customCheckbox1State, customCheckbox1Question,
    customCheckbox2State, customCheckbox2Question,
    customCheckbox3State, customCheckbox3Question,
    customCheckbox4State, customCheckbox4Question,
    questionOrder
  } = req.body;

  if (!title || !topicId) {
    return res.status(400).json({ message: 'Title and topic are required' });
  }

  // Sanitize title length
  if (String(title).trim().length > 200) {
    return res.status(400).json({ message: 'Title must be 200 characters or fewer' });
  }

  if (!customString1State && !customString2State && !customString3State && !customString4State &&
      !customText1State   && !customText2State   && !customText3State   && !customText4State   &&
      !customInt1State    && !customInt2State    && !customInt3State    && !customInt4State    &&
      !customCheckbox1State && !customCheckbox2State && !customCheckbox3State && !customCheckbox4State) {
    return res.status(400).json({ message: 'At least one form field is required' });
  }

  let topic = isUuid(topicId) ? await Topic.findByPk(topicId) : null;
  if (!topic) {
    topic = await Topic.findOne();
  }
  if (!topic) {
    return res.status(404).json({ message: 'No valid topic found' });
  }
  const resolvedTopicId = topic.id;

  const templateData = {
    title: String(title).trim().slice(0, 200),
    description: description ? String(description).trim().slice(0, 2000) : '',
    isPublic: isPublic === undefined ? true : Boolean(isPublic),
    topicId: resolvedTopicId,
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
  };

  const template = await Template.create(templateData);

  // Process tags if provided
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tagName of tags) {
      const trimmedTagName = String(tagName).trim().slice(0, 50);
      if (trimmedTagName) {
        try {
          const [tag] = await Tag.findOrCreate({
            where: { name: trimmedTagName },
            defaults: { name: trimmedTagName }
          });
          await TemplateTag.create({ tagId: tag.id, templateId: template.id });
        } catch (tagError) {
          console.error('[TEMPLATE] Error processing tag:', trimmedTagName, (tagError as Error).message);
        }
      }
    }
  }

  const completeTemplate = await Template.findByPk(template.id, {
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] },
      { model: Tag }
    ]
  });

  res.status(201).json(completeTemplate);
});

export const updateTemplate = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      isPublic, 
      topicId,
      version,
      tags,
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
    
    // Auth first
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!isUuid(id)) {
      return res.status(400).json({ message: 'Invalid template ID format. Please provide a valid UUID.' });
    }

    const template = await Template.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const targetVersion = version !== undefined ? Number(version) : template.version;

    const isOwner = template.userId === req.user.id;
    const isAdmin = req.user.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You must be the template owner or an admin to update this template.' 
      });
    }

    let resolvedTopicId = template.topicId;
    if (topicId) {
      const topicObj = isUuid(topicId) ? await Topic.findByPk(topicId) : await Topic.findOne();
      if (topicObj) resolvedTopicId = topicObj.id;
    }

    const updateData = {
      title: title || template.title,
      description: description !== undefined ? description : template.description,
      isPublic: isPublic === undefined ? template.isPublic : isPublic,
      topicId: resolvedTopicId,
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

    const updatedTemplate = await optimisticUpdate<Template>(
      Template,
      id,
      targetVersion,
      updateData
    );

    if (tags !== undefined) {
      await TemplateTag.destroy({
        where: { templateId: id }
      });
      
      if (Array.isArray(tags) && tags.length > 0) {
        const tagPromises = tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: { name: tagName.trim() }
          });
          return tag;
        });
        
        const resolvedTags = await Promise.all(tagPromises);

        await Promise.all(
          resolvedTags.map(tag => 
            TemplateTag.create({
              tagId: tag.id,
              templateId: id
            })
          )
        );
      }
    }

    const completeTemplate = await Template.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Topic, attributes: ['id', 'name'] },
        { model: Tag }
      ]
    });
    
    if (!completeTemplate) {
      return res.status(404).json({ message: 'Template not found after update' });
    }
    
    res.status(200).json({
      message: 'Template updated successfully',
      template: completeTemplate,
      version: completeTemplate.version
    });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error while updating template' });
  }
});

export const deleteTemplate = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Auth first
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Accept version ONLY from body (not query params or headers to prevent TOCTOU)
    const version = req.body?.version !== undefined ? Number(req.body.version) : undefined;

    if (!isUuid(id)) {
      return res.status(400).json({ 
        message: 'Invalid template ID format. Please provide a valid UUID.' 
      });
    }

    if (version === undefined || isNaN(version)) {
      return res.status(400).json({ 
        message: 'Version field is required for optimistic locking. Please provide it in the request body, query parameters, or X-Version header.' 
      });
    }
    
    const template = await Template.findByPk(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const isOwner = template.userId === req.user.id;
    const isAdmin = req.user.isAdmin === true;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You must be the template owner or an admin to delete this template.' 
      });
    }

    await Comment.destroy({ where: { templateId: id } });
    await Like.destroy({ where: { templateId: id } });
    await FormResponse.destroy({ where: { templateId: id } });

    await optimisticDelete(Template as any, id, version);
    
    res.status(200).json({ message: 'Template deleted successfully' });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error while deleting template' });
  }
});

export const searchTemplates = catchAsync(async (req: Request, res: Response) => {
  try {
    const { query, tag, topicId, limit = 10, page = 1, sort } = req.query;
    
    const whereConditions: any = {
      isPublic: true,
    };

    if (query && typeof query === 'string' && query.trim()) {
      // Fix for PostgreSQL iLike operator
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ];
    }
    
    if (topicId && typeof topicId === 'string') {
      if (isUuid(topicId)) {
        whereConditions.topicId = topicId;
      } else {
        return res.status(400).json({ message: 'Invalid topic ID format' });
      }
    }
    
    // Prepare include conditions for eager loading
    const includeConditions: any[] = [
      { model: User, attributes: ['id', 'name'] },
      { model: Topic, attributes: ['id', 'name'] }
    ];
    
    // Handle tag filtering
    if (tag && typeof tag === 'string' && tag.trim()) {
      includeConditions.push({
        model: Tag,
        attributes: ['id', 'name'],
        where: { name: tag },
        required: true
      });
    } else {
      includeConditions.push({ 
        model: Tag,
        attributes: ['id', 'name'] 
      });
    }

    // Set up sorting
    let order: any[] = [];
    if (sort === 'oldest') {
      order = [['createdAt', 'ASC']];
    } else if (sort === 'popular') {
      // Since we don't have a direct "popularity" metric, we'll default to newest
      order = [['createdAt', 'DESC']];
    } else {
      // Default to newest
      order = [['createdAt', 'DESC']];
    }

    // Pagination parameters
    const pageNumber = Math.max(1, parseInt(page as string) || 1);
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit as string) || 10));
    const offset = (pageNumber - 1) * limitNumber;
    
    const templates = await Template.findAll({
      where: whereConditions,
      include: includeConditions,
      order: order,
      limit: limitNumber,
      offset: offset
    });
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      message: 'Server error while searching templates',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});