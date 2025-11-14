import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardStats } from '@/lib/types';
import { dashboardService } from '@/lib/api/services';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getStats();
      console.log('📊 DASHBOARD - Response from getStats:', response);

      // Gérer différents formats de réponse API
      let statsData: DashboardStats | null = null;

      if (response && typeof response === 'object') {
        statsData = response.data || response;
      }

      console.log('✅ DASHBOARD - Stats loaded:', statsData);
      return statsData;
    } catch (error: any) {
      console.error('❌ DASHBOARD - Failed to fetch stats:', error);
      console.error('Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
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
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
