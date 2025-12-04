import db from '../utils/database';
import { Task, CreateTaskInput, UpdateTaskInput } from '../../../shared/types/task';
import { randomUUID } from 'crypto';

export class TaskService {
  getAllTasks(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters?.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters?.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Task[];
  }

  getTaskById(id: string): Task | undefined {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id) as Task | undefined;
  }

  createTask(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status || 'To Do',
      priority: input.priority || 'Medium',
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, dueDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.dueDate,
      task.createdAt,
      task.updatedAt
    );

    return task;
  }

  updateTask(id: string, input: UpdateTaskInput): Task | null {
    const existing = this.getTaskById(id);
    if (!existing) return null;

    const updated: Task = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.title,
      updated.description,
      updated.status,
      updated.priority,
      updated.dueDate,
      updated.updatedAt,
      id
    );

    return updated;
  }

  deleteTask(id: string): boolean {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}