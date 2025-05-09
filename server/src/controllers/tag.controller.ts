import { Request, Response } from 'express';
import { Tag } from '../models';
import catchAsync from '../utils/catchAsync';
import { optimisticUpdate, optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

/**
 * Get all tags
 * @route GET /api/tags
 */
export const getAllTags = catchAsync(async (_req: Request, res: Response) => {
  const tags = await Tag.findAll();
  res.status(200).json(tags);
});

// Alias for backward compatibility
export const getTags = getAllTags;

/**
 * @route GET /api/tags/:id
 */
export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    
    res.status(200).json(tag);
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route POST /api/tags
 */
export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Tag name is required' });
      return;
    }
    const existingTag = await Tag.findOne({ where: { name } });
    
    if (existingTag) {
      res.status(400).json({ message: 'Tag with this name already exists' });
      return;
    }
    
    const tag = await Tag.create({
      name
    });
    
    res.status(201).json({
      message: 'Tag created successfully',
      tag
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route PUT /api/tags/:id
 */
export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, version } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Tag name is required' });
      return;
    }
    
    if (version === undefined) {
      res.status(400).json({ message: 'version field is required for optimistic locking' });
      return;
    }

    const existingTag = await Tag.findOne({
      where: { name },
      attributes: ['id']
    });
    
    if (existingTag && existingTag.id.toString() !== id) {
      res.status(400).json({ message: 'Tag with this name already exists' });
      return;
    }
    
    const updatedTag = await optimisticUpdate<Tag>(
      Tag as any,
      id,
      version,
      { name, description }
    );
    
    res.status(200).json({
      message: 'Tag updated successfully',
      tag: updatedTag
    });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    res.status(500).json({ message: 'Server error while updating tag' });
  }
};

/**
 * @route DELETE /api/tags/:id
 */
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { version } = req.body;
    
    if (version === undefined) {
      res.status(400).json({ message: 'version field is required for optimistic locking' });
      return;
    }
    
    const tag = await Tag.findByPk(id);
    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }
    
    await optimisticDelete(Tag as any, id, version);
    
    res.status(200).json({
      message: 'Tag deleted successfully'
    });
  } catch (error: any) {
    if (handleOptimisticLockError(error, res)) return;
    console.error('Error deleting tag:', error);
    res.status(500).json({ 
      message: 'Server error while deleting tag',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Aliases for backward compatibility
export const createTopic = createTag;
export const updateTopic = updateTag;
export const deleteTopic = deleteTag;
export const getTopicById = getTagById;
