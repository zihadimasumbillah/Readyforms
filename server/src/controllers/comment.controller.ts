import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Template from '../models/Template';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

/**
 * @route GET /api/comments/template/:templateId
 */
export const getCommentsByTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;
    const template = await Template.findByPk(templateId);
    
    if (!template) {
      res.status(404).json({ message: 'Template not found' });
      return;
    }
    const comments = await Comment.findAll({
      where: {
        templateId
      },
      include: [{
        model: User,
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'ASC']] 
    });
    
    res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route POST /api/comments
 */
export const createComment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { templateId, content } = req.body;
  
  if (!templateId || !content) {
    res.status(400).json({ message: 'Template ID and content are required' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const comment = await Comment.create({
    templateId,
    userId: req.user.id,
    content
  });
  
  res.status(201).json(comment);
});

/**
 * @route DELETE /api/comments/:id
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    const { id } = req.params;
    const { version } = req.body;
    
    if (version === undefined) {
      res.status(400).json({ message: 'version field is required for optimistic locking' });
      return;
    }
    const comment = await Comment.findByPk(id, {
      include: [{ model: Template }]
    });
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const typedComment = comment as Comment & { template?: Template };
    
    const isCommentAuthor = req.user.id === typedComment.userId;
    const isTemplateOwner = typedComment.template && req.user.id === typedComment.template.userId;
    const isAdmin = req.user.isAdmin;
    
    if (!isCommentAuthor && !isTemplateOwner && !isAdmin) {
      res.status(403).json({ 
        message: 'You do not have permission to delete this comment' 
      });
      return;
    }
    await optimisticDelete(Comment as any, id, version);
    
    res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    
    res.status(500).json({ 
      message: 'Server error while deleting comment' 
    });
  }
};