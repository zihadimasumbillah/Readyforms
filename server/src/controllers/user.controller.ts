import { Request, Response } from 'express';
import { User } from '../models';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';

interface AuthenticatedRequest extends Request {
  user: User;
}

// Get all users
export const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Toggle user block status
export const toggleUserBlock = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    // Validate UUID format - use a more reliable regex pattern for UUID validation as backup
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }
    
    // Try catch block to handle any validation errors
    try {
      // Only run validation if the string isn't already a valid format
      if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        isUuid(userId); // This will throw if invalid
      }
    } catch (e) {
      return res.status(400).json({ 
        message: 'Invalid user ID format. Please provide a valid UUID.' 
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cannot block your own account
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot block your own account' });
    }
    
    // Toggle block status
    const newBlockedStatus = !user.blocked;
    await User.update(
      { blocked: newBlockedStatus },
      { where: { id: user.id } }
    );
    
    // Fetch the updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }
    
    res.status(200).json({
      message: `User ${updatedUser.blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error toggling user block status:', error);
    res.status(500).json({ message: 'Server error while updating user block status' });
  }
});

// Toggle user admin status
export const toggleUserAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    // Validate UUID format - use a more reliable regex pattern for UUID validation as backup
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }
    
    // Try catch block to handle any validation errors
    try {
      // Only run validation if the string isn't already a valid format
      if (!userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        isUuid(userId); // This will throw if invalid
      }
    } catch (e) {
      return res.status(400).json({ 
        message: 'Invalid user ID format. Please provide a valid UUID.' 
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cannot change your own admin status
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own admin status' });
    }
    
    // Toggle admin status
    const newAdminStatus = !user.isAdmin;
    await User.update(
      { isAdmin: newAdminStatus },
      { where: { id: user.id } }
    );
    
    // Fetch the updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }
    
    res.status(200).json({
      message: `User ${updatedUser.isAdmin ? 'promoted to admin' : 'demoted from admin'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error toggling user admin status:', error);
    res.status(500).json({ message: 'Server error while updating user admin status' });
  }
});