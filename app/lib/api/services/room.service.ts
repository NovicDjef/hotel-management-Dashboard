import { api } from '../client';
import type { Room, RoomStats, PaginatedResponse } from '@/lib/types';

export const roomService = {
  getAll: async (params?: {
    hotelId: string;
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    floor?: number;
    minCapacity?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => {
    const response = await api.get<Room[]>('/rooms', params);
    return response as unknown as PaginatedResponse<Room>;
  },

  getById: async (id: string, hotelId: string) => {
    const response = await api.get<Room>(`/rooms/${id}`, { hotelId });
    return response.data;
  },

  create: async (data: Partial<Room>) => {
    const response = await api.post<Room>('/rooms', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Room>) => {
    const response = await api.put<Room>(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<Room>(`/rooms/${id}/status`, { status });
    return response.data;
  },

  getByFloor: async (floor: number, hotelId: string) => {
    const response = await api.get<Room[]>(`/rooms/floor/${floor}`, { hotelId });
    return response.data;
  },

  checkAvailability: async (data: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
  }) => {
    const response = await api.post<{ available: boolean }>(
      '/rooms/check-availability',
      data
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<RoomStats>('/rooms/stats');
    return response.data;
  },

  getCleaningNeeded: async () => {
    const response = await api.get<Room[]>('/rooms/cleaning-needed');
    return response.data;
  },
};
