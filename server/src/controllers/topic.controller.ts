import { Request, Response } from 'express';
import { Topic, Template } from '../models';
import catchAsync from '../utils/catchAsync';
import { optimisticUpdate, optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

/**
 * Get all topics
 * @route GET /api/topics
 */
export const getAllTopics = catchAsync(async (_req: Request, res: Response) => {
  const topics = await Topic.findAll();
  res.status(200).json(topics);
});

/**
 * Get topic by ID
 * @route GET /api/topics/:id
 */
export const getTopicById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const topic = await Topic.findByPk(id);
    
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json(topic);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new topic (admin only)
 * @route POST /api/topics
 */
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Topic name is required' });
      return;
    }
    
    // Check if topic with same name exists
    const existingTopic = await Topic.findOne({ where: { name } });
    
    if (existingTopic) {
      res.status(400).json({ message: 'Topic with this name already exists' });
      return;
    }
    
    const topic = await Topic.create({
      name,
      description: description || ''
    });
    
    res.status(201).json({
      message: 'Topic created successfully',
      topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update topic (admin only)
 * @route PUT /api/topics/:id
 */
export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, version } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Topic name is required' });
      return;
    }
    
    if (version === undefined) {
      res.status(400).json({ message: 'version field is required for optimistic locking' });
      return;
    }
    
    // Check if another topic with the same name exists (except this one)
    const existingTopic = await Topic.findOne({
      where: { name },
      attributes: ['id']
    });
    
    if (existingTopic && existingTopic.id.toString() !== id) {
      res.status(400).json({ message: 'Topic with this name already exists' });
      return;
    }
    
    const updatedTopic = await optimisticUpdate<Topic>(
      Topic,
      id,
      version,
      { name, description }
    );
    
    res.status(200).json({
      message: 'Topic updated successfully',
      topic: updatedTopic
    });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    res.status(500).json({ message: 'Server error while updating topic' });
  }
};

/**
 * Delete topic (admin only)
 * @route DELETE /api/topics/:id
 */
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { version } = req.body;
    
    if (version === undefined) {
      res.status(400).json({ message: 'version field is required for optimistic locking' });
      return;
    }
    
    // First check if topic exists
    const topic = await Topic.findByPk(id);
    if (!topic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }

    // Check if templates are using this topic
    const templatesCount = await Template.count({ 
      where: { topicId: id } 
    });

    if (templatesCount > 0) {
      res.status(400).json({
        message: 'Cannot delete topic because it is being used by existing templates. Please reassign or delete those templates first.'
      });
      return;
    }
    
    // Now it's safe to delete the topic
    await optimisticDelete(Topic, id, version);
    
    res.status(200).json({
      message: 'Topic deleted successfully'
    });
  } catch (error: any) {
    if (handleOptimisticLockError(error, res)) return;
    console.error('Error deleting topic:', error);
    res.status(500).json({ 
      message: 'Server error while deleting topic',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
