import { api } from '../client';
import type { Guest, GuestStats, PaginatedResponse } from '@/lib/types';

export const guestService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isVIP?: boolean;
    search?: string;
  }) => {
    console.log('👥 GUEST SERVICE - Fetching all guests with params:', params);
    const response = await api.get<Guest[]>('/guests', params);
    console.log('👥 GUEST SERVICE - getAll response:', response);
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get<Guest>(`/guests/${id}`);
    console.log('👤 GUEST SERVICE - getById response:', response);
    return response.data || response;
  },

  create: async (data: Partial<Guest>) => {
    console.log('👤 GUEST - Creating new guest:', data);
    const response = await api.post<Guest>('/guests', data);
    console.log('✅ GUEST - Guest created:', response);
    return response.data || response;
  },

  update: async (id: string, data: Partial<Guest>) => {
    const response = await api.put<Guest>(`/guests/${id}`, data);
    console.log('✏️ GUEST SERVICE - update response:', response);
    return response.data || response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/guests/${id}`);
    console.log('🗑️ GUEST SERVICE - delete response:', response);
    return response;
  },

  toggleVIP: async (id: string) => {
    const response = await api.patch<Guest>(`/guests/${id}/toggle-vip`);
    console.log('⭐ GUEST SERVICE - toggleVIP response:', response);
    return response.data || response;
  },

  addLoyaltyPoints: async (id: string, points: number) => {
    const response = await api.post<Guest>(`/guests/${id}/loyalty-points`, {
      points,
    });
    console.log('🎁 GUEST SERVICE - addLoyaltyPoints response:', response);
    return response.data || response;
  },

  getStats: async () => {
    console.log('📊 GUEST SERVICE - Fetching stats...');
    const response = await api.get('/statistics/total-guests');
    console.log('📊 GUEST SERVICE - getStats response:', response);
    return response;
  },
};
