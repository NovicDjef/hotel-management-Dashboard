import { api } from '../client';
import type { DashboardStats } from '@/lib/types';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<DashboardStats>('/reports/dashboard');
    return response.data;
  },
};
