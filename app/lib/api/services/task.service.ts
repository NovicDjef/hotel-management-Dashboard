import { api } from '../client';
import type { Task, TaskStats, PaginatedResponse } from '@/lib/types';

export const taskService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
    assignedToId?: string;
    roomId?: string;
  }) => {
    const response = await api.get<Task[]>('/tasks', params);
    return response as unknown as PaginatedResponse<Task>;
  },

  getById: async (id: string) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  getMyTasks: async () => {
    const response = await api.get<Task[]>('/tasks/my-tasks');
    return response.data;
  },

  create: async (data: Partial<Task>) => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  createCleaning: async (roomId: string) => {
    const response = await api.post<Task>('/tasks/cleaning', { roomId });
    return response.data;
  },

  update: async (id: string, data: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response;
  },

  start: async (id: string) => {
    const response = await api.post<Task>(`/tasks/${id}/start`);
    return response.data;
  },

  complete: async (id: string, notes?: string) => {
    const response = await api.post<Task>(`/tasks/${id}/complete`, { notes });
    return response.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await api.post<Task>(`/tasks/${id}/cancel`, { reason });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<TaskStats>('/tasks/stats');
    return response.data;
  },
};
