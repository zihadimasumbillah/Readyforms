import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Template from '../models/Template';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

/**
 * @route GET /api/comments/template/:templateId
 */
export const getCommentsByTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const template = await Template.findByPk(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
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
    
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route POST /api/comments
 */
export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { templateId, content } = req.body;
  
  if (!templateId || !content) {
    return res.status(400).json({ message: 'Template ID and content are required' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
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
export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { version } = req.body;
    
    if (version === undefined) {
      return res.status(400).json({ message: 'version field is required for optimistic locking' });
    }
    const comment = await Comment.findByPk(id, {
      include: [{ model: Template }]
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const typedComment = comment as Comment & { template?: Template };
    
    const isCommentAuthor = req.user.id === typedComment.userId;
    const isTemplateOwner = typedComment.template && req.user.id === typedComment.template.userId;
    const isAdmin = req.user.isAdmin;
    
    if (!isCommentAuthor && !isTemplateOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'You do not have permission to delete this comment' 
      });
    }
    await optimisticDelete(Comment as any, id, version);
    
    return res.status(200).json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    return handleOptimisticLockError(error, res) || res.status(500).json({ 
      message: 'Server error while deleting comment' 
    });
  }
};