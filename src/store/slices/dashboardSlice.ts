import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardStats } from '@/lib/types';
import { dashboardService } from '@/lib/api/services';

interface DashboardState {
  stats: DashboardStats | null;
  totalStaff: any | null;
  totalGuests: any | null;
  totalRevenue: any | null;
  reservationsStats: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  totalStaff: null,
  totalGuests: null,
  totalRevenue: null,
  reservationsStats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      console.log('📊 DASHBOARD - Response from getStats:', response);
      console.log('📊 DASHBOARD - Response.data:', response.data);

      // Gérer le nouveau format de réponse API
      // L'API retourne: { success, message, data: { stats: {...}, charts: {...} } }
      let statsData: DashboardStats | null = null;

      if (response && typeof response === 'object') {
        // Si response.data existe, c'est la structure { stats, charts }
        if (response.data) {
          statsData = response.data as DashboardStats;
        } else {
          statsData = response as DashboardStats;
        }
      }

      console.log('✅ DASHBOARD - Stats loaded:', statsData);
      console.log('✅ DASHBOARD - Stats.stats:', statsData?.stats);
      console.log('✅ DASHBOARD - Stats.charts:', statsData?.charts);
      return statsData;
    } catch (error: any) {
      console.error('❌ DASHBOARD - Failed to fetch stats:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

// ✨ Nouvelles actions pour les statistiques totales
export const fetchTotalStaff = createAsyncThunk(
  'dashboard/fetchTotalStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await (dashboardService as any).getTotalStaff();
      console.log('📊 DASHBOARD SLICE - getTotalStaff response:', response);
      console.log('📊 DASHBOARD SLICE - getTotalStaff data:', response.data);

      // Transformer la réponse API pour le dashboard
      // Le service retourne déjà response.data, donc response = { success, message, data: { total, active, inactive } }
      let staffData: any = null;

      // Les vraies données sont dans response.data
      if (response && response.data) {
        // L'API retourne déjà le bon format: { total, active, inactive }
        staffData = response.data;
        console.log('📊 DASHBOARD - Staff stats received:', staffData);
        console.log('   - Total:', staffData.total);
        console.log('   - Active:', staffData.active);
        console.log('   - Inactive:', staffData.inactive);
      } else {
        // Fallback si le format est différent
        console.log('⚠️ DASHBOARD - Using fallback, response:', response);
        staffData = response;
      }

      return staffData;
    } catch (error: any) {
      console.error('❌ DASHBOARD SLICE - Failed to fetch total staff:', error);
      console.error('❌ Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch total staff');
    }
  }
);

export const fetchTotalGuests = createAsyncThunk(
  'dashboard/fetchTotalGuests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await (dashboardService as any).getTotalGuests();
      console.log('📊 DASHBOARD SLICE - getTotalGuests response:', response);
      console.log('📊 DASHBOARD SLICE - getTotalGuests data:', response.data);

      // Le service retourne déjà response.data, donc response = { success, message, data: { total, withReservations } }
      // Le dashboard attend: { total, withReservations }
      let guestData: any = null;

      // Les vraies données sont dans response.data
      if (response && response.data) {
        guestData = response.data;
        console.log('📊 DASHBOARD - Guest stats:', guestData);
        console.log('   - Total:', guestData.total);
        console.log('   - With reservations:', guestData.withReservations);
      } else {
        // Fallback si le format est différent
        guestData = response;
      }

      return guestData;
    } catch (error: any) {
      console.error('❌ DASHBOARD SLICE - Failed to fetch total guests:', error);
      console.error('❌ Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch total guests');
    }
  }
);

export const fetchTotalRevenue = createAsyncThunk(
  'dashboard/fetchTotalRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await (dashboardService as any).getTotalRevenue();
      console.log('📊 DASHBOARD SLICE - getTotalRevenue response:', response);
      console.log('📊 DASHBOARD SLICE - getTotalRevenue data:', response.data);
      return response.data || response;
    } catch (error: any) {
      console.error('❌ DASHBOARD SLICE - Failed to fetch total revenue:', error);
      console.error('❌ Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch total revenue');
    }
  }
);

export const fetchReservationsStats = createAsyncThunk(
  'dashboard/fetchReservationsStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await (dashboardService as any).getReservationsStats();
      console.log('📊 DASHBOARD SLICE - getReservationsStats response:', response);
      console.log('📊 DASHBOARD SLICE - getReservationsStats data:', response.data);
      return response.data || response;
    } catch (error: any) {
      console.error('❌ DASHBOARD SLICE - Failed to fetch reservations stats:', error);
      console.error('❌ Error details:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reservations stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Nouvelles actions
      .addCase(fetchTotalStaff.fulfilled, (state, action) => {
        state.totalStaff = action.payload;
      })
      .addCase(fetchTotalGuests.fulfilled, (state, action) => {
        state.totalGuests = action.payload;
      })
      .addCase(fetchTotalRevenue.fulfilled, (state, action) => {
        state.totalRevenue = action.payload;
      })
      .addCase(fetchReservationsStats.fulfilled, (state, action) => {
        state.reservationsStats = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
