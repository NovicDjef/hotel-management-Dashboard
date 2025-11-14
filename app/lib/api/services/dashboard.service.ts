import { api } from '../client';
import type { DashboardStats } from '@/lib/types';

export const dashboardService = {
  // Dashboard complet (stats + charts)
  getStats: async () => {
    const response = await api.get<DashboardStats>('/api/v1/statistics/dashboard');
    return response;
  },

  // Statistiques principales uniquement
  getOverview: async () => {
    const response = await api.get('/api/v1/statistics/overview');
    return response;
  },

  // Graphiques uniquement
  getCharts: async () => {
    const response = await api.get('/api/v1/statistics/charts');
    return response;
  },

  // Revenus (jour/semaine/mois/moyen)
  getRevenue: async () => {
    const response = await api.get('/api/v1/statistics/revenue');
    return response;
  },

  // Taux d'occupation
  getOccupancy: async () => {
    const response = await api.get('/api/v1/statistics/occupancy');
    return response;
  },

  // Réservations + annulations
  getReservations: async () => {
    const response = await api.get('/api/v1/statistics/reservations');
    return response;
  },

  // Clients (nouveaux clients + taux de conversion)
  getClients: async () => {
    const response = await api.get('/api/v1/statistics/clients');
    return response;
  },

  // Évolution revenus mensuels (12 mois)
  getMonthlyRevenue: async () => {
    const response = await api.get('/api/v1/statistics/monthly-revenue');
    return response;
  },

  // Taux d'occupation mensuel (12 mois)
  getMonthlyOccupancy: async () => {
    const response = await api.get('/api/v1/statistics/monthly-occupancy');
    return response;
  },

  // Revenu par type de chambre
  getRevenueByRoomType: async () => {
    const response = await api.get('/api/v1/statistics/revenue-by-room-type');
    return response;
  },
};
