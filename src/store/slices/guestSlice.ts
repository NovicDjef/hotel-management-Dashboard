import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Guest, GuestStats } from '@/lib/types';
import { guestService } from '@/lib/api/services';

interface GuestState {
  guests: Guest[];
  selectedGuest: Guest | null;
  stats: GuestStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guests: [],
  selectedGuest: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchGuests = createAsyncThunk(
  'guests/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await guestService.getAll(params);
      console.log('👥 GUESTS - Response from getAll:', response);

      // Gérer différents formats de réponse API
      let guestsData: Guest[] = [];
      if (Array.isArray(response)) {
        guestsData = response;
      } else if (response && typeof response === 'object') {
        guestsData = response.data?.guests || response.data || response.guests || [];
      }

      console.log('✅ GUESTS - Guests loaded:', guestsData.length);
      return guestsData;
    } catch (error: any) {
      console.error('❌ GUESTS - Failed to fetch guests:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch guests');
    }
  }
);

export const fetchGuestStats = createAsyncThunk(
  'guests/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await guestService.getStats();
      console.log('📊 GUESTS - Response from getStats:', response);
      console.log('📊 GUESTS - Response.data:', response.data);

      // Gérer le nouveau format de réponse API
      // Le service retourne déjà response.data, donc response = { success, message, data: { total, withReservations } }
      let statsData: any = null;

      // Les vraies données sont dans response.data
      if (response && response.data) {
        const { total, withReservations } = response.data;

        statsData = {
          total: total || 0,
          vip: 0, // Non fourni par la nouvelle API
          newThisMonth: 0, // Non fourni par la nouvelle API
          repeatGuests: withReservations || 0,
          withReservations: withReservations || 0, // Ajouter aussi le champ original
        };

        console.log('📊 GUESTS - Parsed data:');
        console.log('   - Total clients:', total);
        console.log('   - Clients avec réservations:', withReservations);
      } else {
        // Format ancien ou inattendu
        statsData = response;
      }

      console.log('✅ GUESTS - Stats loaded:', statsData);
      return statsData;
    } catch (error: any) {
      console.error('❌ GUESTS - Failed to fetch stats:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const guestSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guests = action.payload;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGuestStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError } = guestSlice.actions;
export default guestSlice.reducer;
