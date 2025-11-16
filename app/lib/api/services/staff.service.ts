import { api } from '../client';
import type { Staff, StaffStats, PaginatedResponse } from '@/lib/types';

export const staffService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    department?: string;
    search?: string;
  }) => {
    console.log('👥 STAFF SERVICE - Fetching all staff with params:', params);
    const response = await api.get<Staff[]>('/staff', params);
    console.log('👥 STAFF SERVICE - getAll response:', response);
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get<Staff>(`/staff/${id}`);
    console.log('👤 STAFF SERVICE - getById response:', response);
    return response.data || response;
  },

  create: async (data: Partial<Staff>) => {
    console.log('👤 STAFF - Creating new staff member:', data);
    const response = await api.post<Staff>('/auth/staff/register', data);
    console.log('✅ STAFF - Staff member created:', response);
    return response.data || response;
  },

  update: async (id: string, data: Partial<Staff>) => {
    const response = await api.put<Staff>(`/staff/${id}`, data);
    console.log('✏️ STAFF SERVICE - update response:', response);
    return response.data || response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/staff/${id}`);
    console.log('🗑️ STAFF SERVICE - delete response:', response);
    return response;
  },

  getStats: async () => {
    console.log('📊 STAFF SERVICE - Fetching stats...');
    const response = await api.get('/staff/stats');
    console.log('📊 STAFF SERVICE - getStats response:', response.data);
    return response;
  },
};
