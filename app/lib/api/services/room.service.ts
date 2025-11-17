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
    const response = await api.get<any>('/rooms/stats');
    console.log('📊 API Response for /rooms/stats:', response);

    // L'API retourne { success: true, data: { byType: [...] } }
    // Mais api.get pourrait retourner directement response.data
    // Gérons les deux cas
    if (response?.data?.data) {
      return response.data.data; // Format { data: { data: {...} } }
    } else if (response?.data) {
      return response.data; // Format { data: {...} }
    }
    return response; // Format direct {...}
  },

  getCleaningNeeded: async () => {
    const response = await api.get<Room[]>('/rooms/cleaning-needed');
    return response.data;
  },

  // ✨ NOUVELLES MÉTHODES - Attribution de chambres

  // Obtenir les chambres disponibles pour attribution
  getAvailableForAssignment: async (params: {
    roomType?: string;
    checkInDate: string;
    checkOutDate: string;
    hotelId?: string;
  }) => {
    console.log('🔍 ROOM SERVICE - Fetching available rooms for assignment:', params);
    const response = await api.get<Room[]>('/rooms/available-for-assignment', params);
    console.log('✅ ROOM SERVICE - Available rooms:', response);
    return response.data || response;
  },

  // Attribuer une chambre à une réservation
  assignToReservation: async (data: {
    reservationId: string;
    roomId: string;
  }) => {
    console.log('🏨 ROOM SERVICE - Assigning room to reservation:', data);
    const response = await api.post('/rooms/assign-to-reservation', data);
    console.log('✅ ROOM SERVICE - Room assigned:', response);
    return response.data || response;
  },

  // Retirer l'attribution d'une chambre
  unassignFromReservation: async (data: {
    reservationId: string;
    roomId: string;
  }) => {
    console.log('🚫 ROOM SERVICE - Unassigning room from reservation:', data);
    const response = await api.post('/rooms/unassign-from-reservation', data);
    console.log('✅ ROOM SERVICE - Room unassigned:', response);
    return response.data || response;
  },

  // Obtenir toutes les chambres avec leur statut d'occupation
  getAllWithStatus: async (params?: {
    hotelId?: string;
    checkInDate?: string;
    checkOutDate?: string;
  }) => {
    console.log('📊 ROOM SERVICE - Fetching all rooms with status:', params);
    const response = await api.get('/rooms/all-with-status', params);
    console.log('✅ ROOM SERVICE - Rooms with status:', response);
    return response.data || response;
  },
};
