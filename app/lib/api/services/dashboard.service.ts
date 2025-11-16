import { api } from '../client';
import type { DashboardStats } from '@/lib/types';

export const dashboardService = {
  // Dashboard complet (stats + charts)
  getStats: async () => {
    const response = await api.get<DashboardStats>('/statistics/dashboard');
    return response;
  },

  // Statistiques principales uniquement
  getOverview: async () => {
    const response = await api.get('/statistics/overview');
    return response;
  },

  // Graphiques uniquement
  getCharts: async () => {
    const response = await api.get('/statistics/charts');
    return response;
  },

  // Revenus (jour/semaine/mois/moyen)
  getRevenue: async () => {
    const response = await api.get('/statistics/revenue');
    return response;
  },

  // Taux d'occupation
  getOccupancy: async () => {
    const response = await api.get('/statistics/occupancy');
    return response;
  },

  // Réservations + annulations
  getReservations: async () => {
    const response = await api.get('/statistics/reservations');
    return response;
  },

  // Clients (nouveaux clients + taux de conversion)
  getClients: async () => {
    const response = await api.get('/statistics/clients');
    return response;
  },

  // Évolution revenus mensuels (12 mois)
  getMonthlyRevenue: async () => {
    const response = await api.get('/statistics/monthly-revenue');
    return response;
  },

  // Taux d'occupation mensuel (12 mois)
  getMonthlyOccupancy: async () => {
    const response = await api.get('/statistics/monthly-occupancy');
    return response;
  },

  // Revenu par type de chambre
  getRevenueByRoomType: async () => {
    const response = await api.get('/statistics/revenue-by-room-type');
    return response;
  },

  // ✨ NOUVELLES API
  // Décompte du staff
  getTotalStaff: async () => {
    console.log('📊 DASHBOARD - Fetching total staff...');
    const response = await api.get('/statistics/total-staff');
    console.log('✅ DASHBOARD - Total staff response:', response);
    return response;
  },

  // Décompte des clients
  getTotalGuests: async () => {
    console.log('📊 DASHBOARD - Fetching total guests...');
    const response = await api.get('/statistics/total-guests');
    console.log('✅ DASHBOARD - Total guests response:', response);
    return response;
  },

  // Total des gains
  getTotalRevenue: async () => {
    console.log('📊 DASHBOARD - Fetching total revenue...');
    const response = await api.get('/statistics/total-revenue');
    console.log('✅ DASHBOARD - Total revenue response:', response);
    return response;
  },

  // Statistiques des réservations
  getReservationsStats: async () => {
    console.log('📊 DASHBOARD - Fetching reservations stats...');
    const response = await api.get('/statistics/reservations');
    console.log('✅ DASHBOARD - Reservations stats response:', response);
    return response;
  },
};
