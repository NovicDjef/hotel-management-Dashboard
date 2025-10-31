import { api } from '../client';
import type {
  Reservation,
  ReservationStats,
  ReservationCalculation,
  PaginatedResponse
} from '@/lib/types';

export const reservationService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    guestId?: string;
    roomId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const response = await api.get<Reservation[]>('/reservations', params);
    return response as unknown as PaginatedResponse<Reservation>;
  },

  getById: async (id: string) => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  create: async (data: Partial<Reservation>) => {
    const response = await api.post<Reservation>('/reservations/guest', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Reservation>) => {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/reservations/${id}`);
    return response;
  },

  checkIn: async (id: string) => {
    const response = await api.post<Reservation>(`/reservations/${id}/check-in`);
    return response.data;
  },

  checkOut: async (id: string) => {
    const response = await api.post<Reservation>(`/reservations/${id}/check-out`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await api.post<Reservation>(`/reservations/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.post<Reservation>(`/reservations/${id}/cancel`);
    return response.data;
  },

  calculate: async (data: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
  }) => {
    const response = await api.post<ReservationCalculation>(
      '/reservations/calculate',
      data
    );
    return response.data;
  },

  confirmPayment: async (id: string, paymentIntentId: string) => {
    const response = await api.post<Reservation>(
      `/reservations/${id}/confirm-payment`,
      { paymentIntentId }
    );
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<ReservationStats>('/reservations/stats');
    return response.data;
  },
};
