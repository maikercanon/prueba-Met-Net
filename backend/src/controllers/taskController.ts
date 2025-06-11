import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { status } = req.query;
    let filter: any = { userId: req.user._id };
    
    if (status === 'completed') filter.completed = true;
    else if (status === 'pending') filter.completed = false;
    
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (err) {
    console.error('Error getting tasks:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting tasks' 
    });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { title, description, priority, completed } = req.body;
    
    if (!title || title.trim() === '') {
      res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
      return;
    }
    
    const task = new Task({ 
      title: title.trim(), 
      description: description?.trim() || '', 
      priority: priority || 'medium',
      completed: completed || false,
      userId: req.user._id
    });
    
    const savedTask = await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ 
      success: false, 
      message: 'Error creating task' 
    });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title, description, priority, completed } = req.body;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'Task ID is required' 
      });
      return;
    }
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid task ID format' 
      });
      return;
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;
    
    // Find task and verify ownership
    const existingTask = await Task.findOne({ _id: id, userId: req.user._id });
    if (!existingTask) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found or access denied' 
      });
      return;
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(400).json({ 
      success: false, 
      message: 'Error updating task' 
    });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'Task ID is required' 
      });
      return;
    }
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid task ID format' 
      });
      return;
    }
    
    // Find and delete task, verify ownership
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!deletedTask) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found or access denied' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(400).json({ 
      success: false, 
      message: 'Error deleting task' 
    });
  }
};
