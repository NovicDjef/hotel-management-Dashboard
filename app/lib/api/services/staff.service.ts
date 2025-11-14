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
    const response = await api.get<Staff[]>('/staff', params);
    return response as unknown as PaginatedResponse<Staff>;
  },

  getById: async (id: string) => {
    const response = await api.get<Staff>(`/staff/${id}`);
    return response.data;
  },

  create: async (data: Partial<Staff>) => {
    console.log('👤 STAFF - Creating new staff member:', data);
    const response = await api.post<Staff>('/auth/staff/register', data);
    console.log('✅ STAFF - Staff member created:', response);
    return response.data || response;
  },

  update: async (id: string, data: Partial<Staff>) => {
    const response = await api.put<Staff>(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/staff/${id}`);
    return response;
  },

  getStats: async () => {
    const response = await api.get<StaffStats>('/staff/stats');
    return response.data;
  },
};
