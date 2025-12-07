import axios from 'axios';
import type { Task, CreateTaskInput, ParsedTaskFields } from '@shared/types/task';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskAPI = {
  async getAllTasks(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await api.post('/tasks', input);
    return response.data.data;
  },

  async updateTask(id: string, input: Partial<CreateTaskInput>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, input);
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async processVoiceRecording(audioBlob: Blob): Promise<{ transcript: string; parsed: ParsedTaskFields }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    // Get user's timezone and send it with the request
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData.append('timezone', userTimezone);

    const response = await api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      transcript: response.data.data.transcript,
      parsed: response.data.data.parsed,
    };
  },
};