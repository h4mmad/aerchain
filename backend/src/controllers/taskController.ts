import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { CreateTaskInput, UpdateTaskInput } from '../../../shared/types/task';

const taskService = new TaskService();

export const getAllTasks = (req: Request, res: Response) => {
  try {
    const { status, priority, search } = req.query;

    const tasks = taskService.getAllTasks({
      status: status as string,
      priority: priority as string,
      search: search as string,
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

export const getTaskById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = taskService.getTaskById(id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

export const createTask = (req: Request, res: Response) => {
  try {
    const input: CreateTaskInput = req.body;

    // Validation
    if (!input.title || input.title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const task = taskService.createTask(input);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

export const updateTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input: UpdateTaskInput = req.body;

    const task = taskService.updateTask(id, input);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

export const deleteTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = taskService.deleteTask(id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};