import { api } from '../client';
import type { Guest, GuestStats, PaginatedResponse } from '@/lib/types';

export const guestService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isVIP?: boolean;
    search?: string;
  }) => {
    const response = await api.get<Guest[]>('/guests', params);
    return response as unknown as PaginatedResponse<Guest>;
  },

  getById: async (id: string) => {
    const response = await api.get<Guest>(`/guests/${id}`);
    return response.data;
  },

  create: async (data: Partial<Guest>) => {
    const response = await api.post<Guest>('/guests', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Guest>) => {
    const response = await api.put<Guest>(`/guests/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/guests/${id}`);
    return response;
  },

  toggleVIP: async (id: string) => {
    const response = await api.patch<Guest>(`/guests/${id}/toggle-vip`);
    return response.data;
  },

  addLoyaltyPoints: async (id: string, points: number) => {
    const response = await api.post<Guest>(`/guests/${id}/loyalty-points`, {
      points,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<GuestStats>('/guests/stats');
    return response.data;
  },
};
