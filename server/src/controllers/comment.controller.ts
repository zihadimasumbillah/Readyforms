import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Template from '../models/Template';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import { isUuid } from '../utils/uuid';
import { optimisticDelete, handleOptimisticLockError } from '../utils/optimistic-locking';

/**
 * @route GET /api/comments/template/:templateId
 */
export const getCommentsByTemplate = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const templateId = req.params.templateId as string;

  if (!templateId || !isUuid(templateId)) {
    res.status(400).json({ message: 'Valid template ID is required' });
    return;
  }

  const template = await Template.findByPk(templateId);
  if (!template) {
    res.status(404).json({ message: 'Template not found' });
    return;
  }

  const comments = await Comment.findAll({
    where: { templateId },
    include: [{ model: User, attributes: ['id', 'name'] }],
    order: [['createdAt', 'ASC']]
  });

  res.status(200).json(comments);
});

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
export const deleteComment = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const id = req.params.id as string;
  const version = req.body?.version !== undefined ? Number(req.body.version) : undefined;

  if (!id || !isUuid(id)) {
    res.status(400).json({ message: 'Valid comment ID is required' });
    return;
  }

  if (version === undefined || isNaN(version)) {
    res.status(400).json({ message: 'Numeric version field is required for optimistic locking' });
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
    res.status(403).json({ message: 'You do not have permission to delete this comment' });
    return;
  }

  try {
    await optimisticDelete(Comment as any, id, version);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    if (handleOptimisticLockError(error, res)) return;
    throw error;
  }
});