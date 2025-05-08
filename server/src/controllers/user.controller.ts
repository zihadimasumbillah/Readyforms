import { Request, Response } from 'express';
import { User } from '../models';
import catchAsync from '../utils/catchAsync';
import { validate as isUuid } from 'uuid';

interface AuthenticatedRequest extends Request {
  user: User;
}

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

export const toggleUserBlock = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {

    if (id === req.user?.id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'You cannot block your own account' 
      });
    }
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format. Please provide a valid UUID.' 
      });
    }
    

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot block your own account' });
    }
    
    await user.update({ blocked: !user.blocked });
    
    res.status(200).json({
      message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        blocked: user.blocked
      }
    });
  } catch (error) {
    console.error('Error toggling user block status:', error);
    res.status(500).json({ message: 'Server error while updating user block status' });
  }
});

// Toggle user admin status
export const toggleUserAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {

    if (id === req.user?.id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'You cannot change your own admin status' 
      });
    }
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format. Please provide a valid UUID.' 
      });
    }
    
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own admin status' });
    }
    

    const newAdminStatus = !user.isAdmin;
    await User.update(
      { isAdmin: newAdminStatus },
      { where: { id: user.id } }
    );
    
    
    const updatedUser = await User.findByPk(id, {
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